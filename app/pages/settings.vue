<script setup lang="ts">
import { KeyRound, ShieldCheck, Info, CheckCircle2, Eye, EyeOff, Trash2, ArrowUpRight } from 'lucide-vue-next'
import { providerLabels, providerModels, type AiProvider } from '~/composables/useAiSettings'
const settings = useAiSettings()
function switchProvider(provider: AiProvider) {
  if (settings.value.provider === provider) return
  settings.value.provider = provider
  settings.value.model = providerModels[provider]
  settings.value.apiKey = ''
  reveal.value = false
}
const reveal = ref(false)
const providers: { id: AiProvider; mark: string; description: string }[] = [
  { id: 'openai', mark: 'O', description: 'OpenAI' },
  { id: 'deepseek', mark: 'D', description: 'DeepSeek' },
  { id: 'qwen', mark: 'Q', description: '通义千问' },
  { id: 'minimax', mark: 'M', description: 'MiniMax' }
]
</script>
<template>
  <AppShell><template #title>AI 设置</template>
    <div class="page-heading"><span class="eyebrow">AI CONFIGURATION</span><h1>连接你的 AI 服务</h1><p>AI 是可选能力。没有 API Key，你依然可以手动创建、编辑、套用官方模板并导出简历。</p></div>
    <div class="ai-settings-layout">
      <section class="settings-card connection-card" aria-labelledby="connection-heading">
        <div class="settings-card-title"><span class="settings-card-icon"><KeyRound :size="21" /></span><div><h2 id="connection-heading">模型连接</h2><span class="muted small">选择服务商，使用你自己的 API Key。</span></div><span class="session-badge">仅本次会话</span></div>
        <fieldset class="provider-fieldset">
          <legend>AI 服务商</legend>
          <div class="provider-options">
            <label v-for="provider in providers" :key="provider.id" class="provider-option" :class="{ selected: settings.provider === provider.id }">
              <input type="radio" name="ai-provider" :value="provider.id" :checked="settings.provider === provider.id" :aria-label="providerLabels[provider.id]" @change="switchProvider(provider.id)" />
              <span class="provider-mark" :class="`provider-${provider.id}`" aria-hidden="true">{{ provider.mark }}</span>
              <span>{{ provider.description }}</span><CheckCircle2 v-if="settings.provider === provider.id" class="provider-check" :size="14" aria-hidden="true" />
            </label>
          </div>
        </fieldset>
        <div class="connection-fields">
          <label class="field" for="ai-model">模型 ID
            <input id="ai-model" v-model.trim="settings.model" class="technical-input" placeholder="输入可用的模型 ID" autocomplete="off" maxlength="100" aria-describedby="model-hint" />
          </label>
          <p id="model-hint" class="field-hint">已填入推荐模型，也可修改为账户可用的模型。</p>
          <div class="field key-field">
            <label for="ai-key">API Key</label>
            <div class="key-input">
              <KeyRound class="key-input-icon" :size="16" aria-hidden="true" />
              <input id="ai-key" v-model="settings.apiKey" class="technical-input" :type="reveal ? 'text' : 'password'" autocomplete="off" spellcheck="false" placeholder="粘贴你的 API Key" aria-describedby="key-hint" />
              <button type="button" class="key-reveal" :aria-label="reveal ? '隐藏 API Key' : '显示 API Key'" :aria-pressed="reveal" :title="reveal ? '隐藏密钥' : '显示密钥'" @click="reveal = !reveal"><EyeOff v-if="reveal" :size="17" /><Eye v-else :size="17" /></button>
            </div>
          </div>
          <p id="key-hint" class="field-hint">密钥只保留在当前页面会话，刷新或切换服务商后清除。</p>
          <p v-if="settings.provider === 'minimax'" class="provider-note">MiniMax 使用中国区开放平台，请填写对应平台的密钥。</p>
        </div>
        <div class="settings-footer">
          <span class="connection-status" :class="{ ready: settings.apiKey.trim() }" aria-live="polite"><span class="status-dot" />{{ settings.apiKey.trim() ? '已填写密钥，尚未验证' : '等待填写密钥' }}</span>
          <button type="button" class="button button-ghost" :disabled="!settings.apiKey" @click="settings.apiKey = ''; reveal = false"><Trash2 :size="15" /> 清除密钥</button>
        </div>
      </section>
      <aside class="settings-help" aria-label="连接说明">
        <div class="settings-help-item"><span class="help-icon"><ShieldCheck :size="19" /></span><h3>你的密钥，由你掌握</h3><p>不写入浏览器存储，不保存到服务器数据库。AI 请求会经由本站服务器转发，请只在可信站点填写密钥。</p></div>
        <div class="settings-help-item"><span class="help-icon"><Info :size="19" /></span><h3>按需使用，按量计费</h3><p>只有主动生成建议时才发送所选简历文本。费用由对应服务商收取，填写密钥不会自动调用模型。</p></div>
        <a v-if="settings.provider === 'minimax'" class="settings-doc-link" href="https://platform.minimax.cn/docs/api-reference/text-openai-api" target="_blank" rel="noopener noreferrer">MiniMax 接口文档 <ArrowUpRight :size="14" /></a>
        <p class="settings-help-footnote">支持四家服务商的固定地址。暂不支持自定义 API 地址及 Ollama。</p>
      </aside>
    </div>
  </AppShell>
</template>
