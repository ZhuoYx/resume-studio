import type { AiProvider } from '~/composables/useAiSettings'
export type PolishInstruction = 'professional' | 'concise' | 'clarity' | 'jd'
export async function polishText(args: {
  provider: AiProvider, model: string, apiKey: string,
  original: string, instruction: PolishInstruction, jobDescription?: string
}): Promise<string> {
  const result = await $fetch<{ proposal: string }>('/api/ai/polish', { method: 'POST', body: args })
  return result.proposal
}
