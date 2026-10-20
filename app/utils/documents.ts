import type { ResumeData } from '~/types/resume'
import { downloadBlob, safeFilename } from '~/utils/download'

export interface DocumentParagraph { id: number; original: string; text: string }
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
const MAX_FILE_SIZE = 10 * 1024 * 1024
const MAX_XML_SIZE = 8 * 1024 * 1024

export function validateFile(file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!['pdf', 'docx'].includes(extension ?? '')) throw new Error('仅支持 .pdf 或 .docx 文件')
  if (file.size > MAX_FILE_SIZE) throw new Error('文件不能超过 10MB')
  if (!file.size) throw new Error('上传的文件为空')
  return extension as 'pdf' | 'docx'
}
function parseWordXml(xml: string): Document {
  if (xml.length > MAX_XML_SIZE) throw new Error('文档内容过大')
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  if (doc.querySelector('parsererror')) throw new Error('无法解析 DOCX 文档结构')
  return doc
}
function getParagraphs(doc: Document): Element[] {
  return Array.from(doc.getElementsByTagNameNS(W_NS, 'p'))
}
function paragraphText(p: Element): string {
  return Array.from(p.getElementsByTagNameNS(W_NS, 't')).map(t => t.textContent ?? '').join('')
}

export async function readDocxParagraphs(file: File): Promise<DocumentParagraph[]> {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const entry = zip.file('word/document.xml')
  if (!entry) throw new Error('缺少 DOCX 主文档内容')
  const doc = parseWordXml(await entry.async('string'))
  return getParagraphs(doc)
    .map((p, id) => ({ id, original: paragraphText(p), text: paragraphText(p) }))
    .filter(p => p.original.trim())
}

export async function exportPatchedDocx(source: File, edited: DocumentParagraph[]): Promise<void> {
  const JSZip = (await import('jszip')).default
  const zip = await JSZip.loadAsync(await source.arrayBuffer())
  const entry = zip.file('word/document.xml')
  if (!entry) throw new Error('找不到原始 DOCX 内容')
  const doc = parseWordXml(await entry.async('string'))
  const paragraphs = getParagraphs(doc)
  for (const { id, original, text } of edited) {
    if (text === original) continue
    const p = paragraphs[id]
    if (!p || paragraphText(p) !== original) throw new Error('源文档发生变化，无法安全应用修改')
    const runs = Array.from(p.getElementsByTagNameNS(W_NS, 't'))
    if (!runs.length) continue
    // Preserve paragraph and run XML styling. Spread replacement across existing runs
    // proportionally; rich-text spans may shift and page breaks can change after edits.
    const lengths = runs.map(r => (r.textContent ?? '').length)
    const originalLength = lengths.reduce((a, b) => a + b, 0)
    let offset = 0
    let oldOffset = 0
    runs.forEach((node, i) => {
      oldOffset += lengths[i] ?? 0
      const until = i === runs.length - 1 ? text.length : Math.round(oldOffset / Math.max(1, originalLength) * text.length)
      node.textContent = text.slice(offset, until)
      node.setAttribute('xml:space', 'preserve')
      offset = until
    })
  }
  zip.file('word/document.xml', new XMLSerializer().serializeToString(doc))
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  downloadBlob(blob, `${safeFilename(source.name.replace(/\.docx$/i, ''))}-优化版.docx`)
}

export async function readPdfParagraphs(file: File): Promise<DocumentParagraph[]> {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
  pdfjs.GlobalWorkerOptions.workerSrc = (await import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')).default
  const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), useSystemFonts: true })
  try {
    const doc = await task.promise
    if (doc.numPages > 30) throw new Error('暂支持最多 30 页的文本型 PDF')
    const parts: DocumentParagraph[] = []
    for (let pageNo = 1; pageNo <= doc.numPages; pageNo++) {
      const page = await doc.getPage(pageNo)
      const content = await page.getTextContent()
      const lines: string[] = []
      let lastY: number | undefined
      let buffer = ''
      for (const item of content.items) {
        if (!('str' in item)) continue
        const y = item.transform[5] ?? 0
        if (lastY !== undefined && Math.abs(y - lastY) > 3 && buffer.trim()) {
          lines.push(buffer.trim())
          buffer = ''
        }
        buffer += `${item.str}${item.hasEOL ? ' ' : ' '}`
        lastY = y
      }
      if (buffer.trim()) lines.push(buffer.trim())
      lines.forEach(line => parts.push({ id: parts.length, original: line, text: line }))
    }
    if (!parts.length) throw new Error('未提取到文字，扫描件 PDF 暂不支持 OCR')
    return parts
  } finally {
    await task.destroy()
  }
}

export async function exportResumeDocx(resume: ResumeData): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, BorderStyle } = await import('docx')
  const { profile, experiences, projects, education, skills } = resume
  const colors = { minimal: '263146', business: '264A75', graduate: '52766C', engineer: '1E5082' }
  const color = colors[resume.template]
  const font = resume.template === 'business' ? 'Georgia' : resume.template === 'engineer' ? 'Consolas' : 'Arial'
  const p = (value: string) => new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: value, font, size: 20 })] })
  const head = (value: string) => new Paragraph({ spacing: { before: 260, after: 110 }, border: { bottom: { color, style: BorderStyle.SINGLE, size: 6 } }, children: [new TextRun({ text: value, bold: true, color, font, size: 24 })] })
  const children = [
    new Paragraph({ alignment: resume.template === 'business' || resume.template === 'engineer' ? AlignmentType.LEFT : AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: profile.name || '你的姓名', font, bold: true, size: 38, color })] }),
    new Paragraph({ alignment: resume.template === 'business' || resume.template === 'engineer' ? AlignmentType.LEFT : AlignmentType.CENTER, children: [new TextRun({ text: profile.title, font, color, size: 23 })] }),
    p([profile.email, profile.phone, profile.location, profile.website].filter(Boolean).join('  |  '))
  ]
  if (profile.summary) children.push(head('个人简介'), p(profile.summary))
  if (experiences.length) {
    children.push(head('工作经历'))
    experiences.forEach(e => {
      children.push(p(`${e.company} · ${e.role}  ${e.period}`), p(e.description))
    })
  }
  if (projects.length) {
    children.push(head('项目经历'))
    projects.forEach(e => children.push(p(`${e.name} · ${e.role}  ${e.period}`), p(e.description)))
  }
  if (education.length) {
    children.push(head('教育经历'))
    education.forEach(e => children.push(p(`${e.school} · ${e.degree}  ${e.period}`), p(e.description)))
  }
  if (skills.trim()) children.push(head('专业技能'), p(skills))
  const doc = new Document({ sections: [{ properties: {}, children }] })
  downloadBlob(await Packer.toBlob(doc), `${safeFilename(profile.name)}-简历.docx`)
}
