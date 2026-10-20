const MAX_AVATAR_BYTES = 5 * 1024 * 1024
const AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
export const AVATAR_WIDTH = 300
export const AVATAR_HEIGHT = 400

export function validateAvatarFile(file: Pick<File, 'size' | 'type'>): void {
  if (!AVATAR_TYPES.has(file.type)) throw new Error('请选择 JPG、PNG 或 WebP 格式的照片')
  if (!file.size) throw new Error('照片文件为空，请重新选择')
  if (file.size > MAX_AVATAR_BYTES) throw new Error('照片不能超过 5MB')
}

// Only accept locally embedded JPEGs, never remote URLs in previews or exports.
export function avatarSource(value?: string | null): string {
  return typeof value === 'string' && value.length <= 1024 * 1024
    && (value.length - 'data:image/jpeg;base64,'.length) % 4 === 0
    && /^data:image\/jpeg;base64,\/9j\/[A-Za-z0-9+/]*={0,2}$/.test(value) ? value : ''
}

export function avatarBytes(value?: string | null): Uint8Array | undefined {
  const source = avatarSource(value)
  if (!source) return undefined
  const binary = atob(source.slice(source.indexOf(',') + 1))
  return Uint8Array.from(binary, char => char.charCodeAt(0))
}

/** Center crop to a 3:4 portrait and flatten to a small JPEG, stripping metadata. */
export async function prepareAvatar(file: File): Promise<string> {
  validateAvatarFile(file)
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    try { await image.decode() }
    catch { throw new Error('无法读取这张照片，请换一张有效的图片') }
    const { naturalWidth: width, naturalHeight: height } = image
    if (!width || !height || width * height > 32_000_000) {
      throw new Error('照片尺寸过大或无效，请使用不超过 3200 万像素的图片')
    }
    const canvas = document.createElement('canvas')
    canvas.width = AVATAR_WIDTH
    canvas.height = AVATAR_HEIGHT
    const context = canvas.getContext('2d')
    if (!context) throw new Error('浏览器无法处理照片，请重试或更换浏览器')
    const cropWidth = Math.min(width, height * AVATAR_WIDTH / AVATAR_HEIGHT)
    const cropHeight = cropWidth * AVATAR_HEIGHT / AVATAR_WIDTH
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, AVATAR_WIDTH, AVATAR_HEIGHT)
    context.drawImage(image, (width - cropWidth) / 2, (height - cropHeight) / 2,
      cropWidth, cropHeight, 0, 0, AVATAR_WIDTH, AVATAR_HEIGHT)
    const source = canvas.toDataURL('image/jpeg', 0.9)
    if (!avatarSource(source)) throw new Error('照片转换失败，请重新选择')
    return source
  } finally { URL.revokeObjectURL(url) }
}
