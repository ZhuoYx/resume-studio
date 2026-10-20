<script setup lang="ts">
import { Camera, Upload, Trash2 } from 'lucide-vue-next'
import { avatarSource, prepareAvatar } from '~/utils/avatar'
const avatar = defineModel<string | null | undefined>()
const source = computed(() => avatarSource(avatar.value))
const input = ref<HTMLInputElement>()
const busy = ref(false)
const error = ref('')
let operation = 0
onBeforeUnmount(() => { operation++ })
async function upload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return
  const current = ++operation
  busy.value = true
  error.value = ''
  try {
    const result = await prepareAvatar(file)
    if (current === operation) avatar.value = result
  } catch (err) {
    if (current === operation) error.value = err instanceof Error ? err.message : '照片处理失败，请重试'
  } finally { if (current === operation) busy.value = false }
}
function remove() { avatar.value = null; error.value = '' }
</script>

<template>
  <div class="avatar-upload">
    <div class="avatar-upload-row">
      <div class="avatar-thumbnail">
        <img v-if="source" :src="source" alt="当前简历照片" width="72" height="96" />
        <template v-else><Camera :size="23" :stroke-width="1.5" /><span>个人照片</span></template>
      </div>
      <div class="avatar-upload-copy">
        <div class="avatar-upload-title">简历照片 <span>选填</span></div>
        <p>不上传也可正常使用。照片居中裁为 3:4。</p>
        <input ref="input" type="file" class="sr-only" accept="image/jpeg,image/png,image/webp" aria-label="选择简历照片" :disabled="busy" tabindex="-1" @change="upload" />
        <div class="avatar-upload-actions">
          <button type="button" class="button small-button" :disabled="busy" @click="input?.click()"><Upload :size="14" />{{ busy ? '处理照片中…' : source ? '更换照片' : '上传照片' }}</button>
          <button v-if="source" type="button" class="button button-ghost small-button" :disabled="busy" @click="remove"><Trash2 :size="14" />移除</button>
        </div>
        <span class="avatar-file-hint">JPG / PNG / WebP · 最大 5MB · 仅本地保存</span>
      </div>
    </div>
    <p v-if="error" class="form-error" role="alert">{{ error }}</p>
    <span v-if="busy" class="sr-only" role="status">正在处理照片</span>
  </div>
</template>
