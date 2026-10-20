export type AiProvider = 'openai' | 'deepseek' | 'qwen'
export const providerModels: Record<AiProvider, string> = {
  openai: 'gpt-4.1-mini',
  deepseek: 'deepseek-chat',
  qwen: 'qwen-plus'
}
export function useAiSettings() {
  // Deliberately held in memory only; do NOT persist API keys in LocalStorage / IndexedDB.
  return useState('ai-session-settings', () => ({
    provider: 'openai' as AiProvider,
    model: providerModels.openai,
    apiKey: ''
  }))
}
