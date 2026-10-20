<script setup lang="ts">
import { Sparkles, Check, RotateCcw } from 'lucide-vue-next'
import type { PolishInstruction } from '~/utils/ai'
import { polishText } from '~/utils/ai'
const text = defineModel<string>({ required: true })
const settings = useAiSettings()
const mode = ref<PolishInstruction>('professional')
const jobDescription = ref('')
const proposed = ref('')
const busy = ref(false)
const error = ref('')
async function run() {
  error.value = ''; proposed.value = ''
  if (!text.value.trim() || !settings.value.apiKey.trim()) return
  busy.value = true
  try {
    proposed.value = await polishText({ ...settings.value, original: text.value, instruction: mode.value, jobDescription: jobDescription.value })
  } catch (e: any) {
    error.value = e?.data?.statusMessage ?? e?.message ?? 'AI 请求失败'
  } finally { busy.value = false }
}
watch(text, () => { proposed.value = '' })
</script>
<template>
  <div class="ai-inline">
    <div class="ai-control-row">
      <span class="ai-label"><Sparkles :size="14" /> AI 辅助</span>
      <select v-model="mode" aria-label="AI 优化方式">
        <option value="professional">专业润色</option><option value="concise">精简表达</option><option value="clarity">修正表达</option><option value="jd">岗位匹配</option>
      </select>
      <button type="button" class="button small-button" :disabled="busy || !text.trim() || !settings.apiKey.trim()" @click="run">{{ busy ? '正在生成…' : '生成建议' }}</button>
    </div>
    <textarea v-if="mode === 'jd'" v-model="jobDescription" rows="3" placeholder="粘贴目标岗位 JD（仅用于本次请求）" maxlength="6000" aria-label="目标岗位描述" />
    <NuxtLink v-if="!settings.apiKey" class="tiny-link" to="/settings">请先在 AI 设置中填写 API Key（不影响手动编辑）</NuxtLink>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <div v-if="proposed" class="ai-proposal"><div class="ai-proposal-title">AI 修改建议（未自动覆盖）</div><p>{{ proposed }}</p>
      <div class="row-actions"><button type="button" class="button button-primary small-button" @click="text = proposed; proposed = ''"><Check :size="14" /> 接受修改</button><button type="button" class="button small-button" @click="proposed = ''"><RotateCcw :size="14" /> 放弃</button></div>
    </div>
  </div>
</template>
