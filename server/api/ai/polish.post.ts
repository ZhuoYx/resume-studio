import { z } from 'zod'
import { createError, readBody, setHeader, getHeader } from 'h3'

const schema = z.object({
  provider: z.enum(['openai', 'deepseek', 'qwen']),
  apiKey: z.string().trim().min(8).max(1024),
  model: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9._:/-]+$/),
  original: z.string().trim().min(2).max(12000),
  instruction: z.enum(['professional', 'concise', 'clarity', 'jd']),
  jobDescription: z.string().max(6000).optional()
})
const endpoint: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  deepseek: 'https://api.deepseek.com/chat/completions',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions'
}
const guides: Record<string, string> = {
  professional: '提升专业性，采用清晰、符合中文简历习惯的表达',
  concise: '删减冗余描述，让文案简练但信息完整',
  clarity: '修正语病、逻辑和错别字，保留原意',
  jd: '对照岗位说明调整相关事实的表述和重点，但不得捏造经历和技能'
}

export default defineEventHandler(async event => {
  setHeader(event, 'Cache-Control', 'no-store')
  const declaredSize = Number(getHeader(event, 'content-length') || 0)
  if (declaredSize > 26000) throw createError({ statusCode: 413, statusMessage: 'AI 请求内容过大' })
  const input = schema.safeParse(await readBody(event))
  if (!input.success) throw createError({ statusCode: 400, statusMessage: '无效的 AI 请求参数' })
  const { provider, model, apiKey, original, instruction, jobDescription } = input.data
  if (instruction === 'jd' && !jobDescription?.trim()) {
    throw createError({ statusCode: 400, statusMessage: '请先提供目标岗位描述' })
  }
  // Fixed endpoints only: never accept a caller-supplied URL to prevent proxy SSRF.
  let response: Response
  try {
    response = await fetch(endpoint[provider]!, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model, temperature: 0.3, max_tokens: 1600,
        messages: [
          { role: 'system', content: `你是一名专业中文简历编辑。${guides[instruction]}。禁止虚构业绩数字、学历、工作经历或技能。只输出修改后的正文，不要加入说明，不要输出 Markdown 代码块。尽量控制篇幅接近原文，以减少排版变化。` },
          { role: 'user', content: `原文：\n${original}${jobDescription ? `\n\n目标岗位说明：\n${jobDescription}` : ''}` }
        ]
      }),
      signal: AbortSignal.timeout(45000)
    })
  } catch {
    throw createError({ statusCode: 502, statusMessage: 'AI 服务连接失败或响应超时' })
  }
  if (!response.ok) {
    const status = response.status === 401 || response.status === 403 ? 401 : 502
    throw createError({ statusCode: status, statusMessage: status === 401 ? 'API Key 无效或没有模型权限' : 'AI 服务请求失败，请检查模型和额度' })
  }
  const result = await response.json() as { choices?: { message?: { content?: string } }[] }
  const proposal = result.choices?.[0]?.message?.content?.trim()
  if (!proposal || proposal.length > 24000) throw createError({ statusCode: 502, statusMessage: 'AI 未返回有效润色文本' })
  return { proposal }
})
