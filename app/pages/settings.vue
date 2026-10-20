<script setup lang="ts">
import { KeyRound, ShieldAlert, Info, CheckCircle2 } from 'lucide-vue-next'
import { providerModels, type AiProvider } from '~/composables/useAiSettings'
const settings = useAiSettings()
function switchProvider(value: Event) {
  const provider = (value.target as HTMLSelectElement).value as AiProvider
  settings.value.provider = provider
  settings.value.model = providerModels[provider]
}
const reveal = ref(false)
</script>
<template>
  <AppShell><template #title>AI 设置</template>
    <div class="page-heading"><span class="eyebrow">AI CONFIGURATION</span><h1>连接你的 AI 服务</h1><p>AI 是可选能力。没有 API Key，你依然可以手动创建、编辑、套用官方模板并导出简历。</p></div>
    <div class="settings-card"><div class="settings-card-title"><span class="settings-card-icon"><KeyRound :size="21" /></span><div><h2>自带 API Key</h2><span class="muted small">仅在当前页面会话中使用，不写入浏览器存储。</span></div></div>
      <div class="settings-grid"><label class="field">AI 服务商 <select :value="settings.provider" @change="switchProvider"><option value="openai">OpenAI</option><option value="deepseek">DeepSeek</option><option value="qwen">通义千问（Qwen）</option></select></label>
        <label class="field">模型 ID <input v-model.trim="settings.model" placeholder="输入可用的模型 ID" autocomplete="off" maxlength="100" /></label></div>
      <label class="field">API Key <span class="key-input"><input v-model="settings.apiKey" :type="reveal ? 'text' : 'password'" autocomplete="off" spellcheck="false" placeholder="sk-…" /><button type="button" class="button small-button" @click="reveal = !reveal">{{ reveal ? '隐藏' : '显示' }}</button></span></label>
      <div class="settings-footer"><span v-if="settings.apiKey" class="key-present"><CheckCircle2 :size="16" /> 当前会话已填写 API Key</span><span v-else class="muted small">尚未填写 API Key</span><button class="button" @click="settings.apiKey = ''">清除密钥</button></div>
    </div>
    <div class="notice-card"><ShieldAlert :size="22" /><div><strong>关于密钥与隐私</strong><p>你输入的 Key 会随 AI 请求经由此网站的 Nuxt 服务器代理发送给对应服务商。网站运营者原则上能看到流经其服务器的请求，因此只应在可信站点输入密钥。请勿使用权限过大的长期密钥。简历文本只有在你主动发起 AI 优化时才会发送。</p><p>V1 不提供账户或密钥云端保存。浏览器刷新后需要重新填写。AI 请求可能产生第三方服务商费用。</p></div></div>
    <div class="notice-card secondary"><Info :size="22" /><div><strong>模型兼容性</strong><p>V1 仅支持 OpenAI、DeepSeek 和 Qwen 的固定服务地址。不同模型所需参数可能不同，需按服务商说明填写可用模型 ID。自定义 API 地址及 Ollama 暂不纳入 V1，以防公共代理接口被滥用。</p></div></div>
  </AppShell>
</template>
