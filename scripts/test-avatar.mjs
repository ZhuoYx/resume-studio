import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import ts from 'typescript'
import JSZip from 'jszip'

function moduleUrl(path, aliases = {}) {
  let source = readFileSync(new URL(path, import.meta.url), 'utf8')
  for (const [name, url] of Object.entries(aliases)) source = source.replaceAll(`'${name}'`, JSON.stringify(url))
  const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText
  return `data:text/javascript;base64,${Buffer.from(js).toString('base64')}`
}
const avatarUrl = moduleUrl('../app/utils/avatar.ts')
const { validateAvatarFile, avatarSource, avatarBytes } = await import(avatarUrl)
const { createResume } = await import(moduleUrl('../app/types/resume.ts'))
const { createResumeDocx } = await import(moduleUrl('../app/utils/documents.ts', {
  '~/utils/avatar': avatarUrl,
  '~/utils/download': moduleUrl('../app/utils/download.ts'),
  docx: import.meta.resolve('docx')
}))
// A valid 1x1 JPEG keeps the binary export regression fixture self-contained.
const jpeg = '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD9U6KKKAP/2Q=='
const source = `data:image/jpeg;base64,${jpeg}`

test('photo input rejects unsupported, empty and oversized files', () => {
  for (const type of ['image/jpeg', 'image/png', 'image/webp']) validateAvatarFile({ type, size: 1024 })
  for (const file of [{ type: 'image/svg+xml', size: 100 }, { type: 'image/jpeg', size: 0 }, { type: 'image/png', size: 5 * 1024 * 1024 + 1 }]) {
    assert.throws(() => validateAvatarFile(file))
  }
})

test('missing avatars remain optional and remote or malformed image sources are ignored', () => {
  for (const value of [undefined, null, '', 'https://example.com/photo.jpg', 'data:image/svg+xml;base64,AAAA', 'data:image/jpeg;base64,A']) {
    assert.equal(avatarSource(value), '')
    assert.equal(avatarBytes(value), undefined)
  }
  assert.deepEqual(Buffer.from(avatarBytes(source)), Buffer.from(jpeg, 'base64'))
})

test('all four DOCX templates embed the JPEG and resolve the image relationship', async () => {
  for (const template of ['minimal', 'business', 'graduate', 'engineer']) {
    const resume = createResume()
    resume.template = template
    resume.profile.avatar = source
    const zip = await JSZip.loadAsync(await (await createResumeDocx(resume)).arrayBuffer())
    const media = Object.keys(zip.files).filter(name => /^word\/media\/.+\.jpg$/.test(name))
    assert.equal(media.length, 1)
    assert.deepEqual(await zip.file(media[0]).async('nodebuffer'), Buffer.from(jpeg, 'base64'))
    const xml = await zip.file('word/document.xml').async('string')
    assert.match(xml, /<w:drawing>/)
    assert.match(xml, /cx="857250" cy="1143000"/)
    assert.match(await zip.file('word/_rels/document.xml.rels').async('string'), /relationships\/image/)
  }
})

test('empty, removed and legacy avatars export without a photo or reserved photo table', async () => {
  for (const avatar of [undefined, null, '']) {
    const resume = createResume()
    resume.profile.avatar = avatar
    const zip = await JSZip.loadAsync(await (await createResumeDocx(resume)).arrayBuffer())
    const xml = await zip.file('word/document.xml').async('string')
    assert.doesNotMatch(xml, /<w:drawing>|<w:tbl>/)
    assert.equal(Object.keys(zip.files).filter(name => /^word\/media\/.+\.jpg$/.test(name)).length, 0)
  }
})
