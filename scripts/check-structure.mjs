import { existsSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import assert from 'node:assert/strict'

const root = resolve(import.meta.dirname, '..')
const mustExist = [
  'nuxt.config.ts', 'package.json', 'app/pages/index.vue', 'app/pages/editor.vue',
  'app/pages/import.vue', 'app/pages/settings.vue', 'app/components/ResumePreview.vue',
  'app/components/ResumeForm.vue', 'app/utils/documents.ts', 'app/stores/resume.ts',
  'server/api/ai/polish.post.ts', 'app/assets/css/main.css'
]
for (const file of mustExist) assert.ok(existsSync(join(root, file)), `Missing ${file}`)
const packageInfo = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
assert.match(packageInfo.dependencies.nuxt, /\^4/)
const templates = readFileSync(join(root, 'app/types/resume.ts'), 'utf8')
for (const name of ['minimal', 'business', 'graduate', 'engineer']) assert.ok(templates.includes(`id: '${name}'`))
const proxy = readFileSync(join(root, 'server/api/ai/polish.post.ts'), 'utf8')
assert.ok(!proxy.includes('body.baseUrl'), 'Never use a user-supplied proxy URL')
assert.ok(proxy.includes('AbortSignal.timeout'))
const css = readFileSync(join(root, 'app/assets/css/main.css'), 'utf8')
assert.ok(css.includes('@media(max-width:700px)'))
assert.ok(css.includes('@media print'))
console.log('Static project structure checks passed (not a build or browser test).')
