export type AiProvider = 'openai' | 'deepseek' | 'qwen' | 'minimax'
export const providerLabels: Record<AiProvider, string> = {
  openai: 'OpenAI', deepseek: 'DeepSeek', qwen: '通义千问（Qwen）', minimax: 'MiniMax'
}
export const providerModels: Record<AiProvider, string> = {
  openai: 'gpt-4.1-mini',
  deepseek: 'deepseek-chat',
  qwen: 'qwen-plus',
  minimax: 'MiniMax-M3.1-Flash'
}
export function useAiSettings() {
  // Deliberately held in memory only; do NOT persist API keys in LocalStorage / IndexedDB.
  return useState('ai-session-settings', () => ({
    provider: 'openai' as AiProvider,
    model: providerModels.openai,
    apiKey: ''
  }))
}
