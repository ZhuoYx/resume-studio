export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
export function safeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|\x00-\x1F]/g, '_').trim().slice(0, 50) || '简历'
}
