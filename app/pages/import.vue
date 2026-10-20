<script setup lang="ts">
import { UploadCloud, Sparkles, Download, FileText, ClipboardCopy, Check, X, ArrowLeft, Printer } from 'lucide-vue-next'
import { validateFile, readDocxParagraphs, readPdfParagraphs, exportPatchedDocx, type DocumentParagraph } from '~/utils/documents'
import { polishText, type PolishInstruction } from '~/utils/ai'
const settings = useAiSettings()
const file = shallowRef<File | null>(null)
const format = ref<'pdf' | 'docx' | ''>('')
const pdfAvatar = ref<string | null>(null)
let importController: AbortController | undefined
onBeforeUnmount(() => importController?.abort())
const paragraphs = ref<DocumentParagraph[]>([])
const selectedId = ref<number | null>(null)
const proposed = ref('')
const uploadBusy = ref(false)
const aiBusy = ref(false)
const downloadBusy = ref(false)
const error = ref('')
const instruction = ref<PolishInstruction>('professional')
const jobDescription = ref('')
const current = computed(() => paragraphs.value.find(p => p.id === selectedId.value))
const changed = computed(() => paragraphs.value.filter(p => p.text !== p.original).length)
async function upload(event: Event) {
  const input = event.target as HTMLInputElement
  const chosen = input.files?.[0]
  if (!chosen) return
  importController?.abort()
  importController = new AbortController()
  file.value = null; pdfAvatar.value = null; paragraphs.value = []; proposed.value = ''; selectedId.value = null; error.value = ''
  uploadBusy.value = true
  try {
    format.value = validateFile(chosen)
    const extracted = format.value === 'pdf'
      ? await readPdfParagraphs(chosen, importController.signal)
      : await readDocxParagraphs(chosen)
    if (!extracted.length) throw new Error('未提取到可编辑的文字')
    file.value = chosen
    paragraphs.value = extracted
    selectedId.value = extracted[0]?.id ?? null
  } catch (e: any) { error.value = e?.message ?? '文件解析失败' }
  finally { uploadBusy.value = false; input.value = '' }
}
async function runAi() {
  if (!current.value || !settings.value.apiKey || aiBusy.value) return
  aiBusy.value = true; error.value = ''; proposed.value = ''
  try {
    proposed.value = await polishText({ ...settings.value, original: current.value.text, instruction: instruction.value, jobDescription: jobDescription.value })
  } catch (e: any) { error.value = e?.data?.statusMessage ?? e?.message ?? '润色失败' }
  finally { aiBusy.value = false }
}
function apply() { if (current.value && proposed.value) { current.value.text = proposed.value; proposed.value = '' } }
function select(id: number) { selectedId.value = id; proposed.value = ''; error.value = '' }
async function exportDocx() {
  if (!file.value) return
  downloadBusy.value = true; error.value = ''
  try { await exportPatchedDocx(file.value, paragraphs.value) }
  catch (e: any) { error.value = e?.message ?? '导出失败' }
  finally { downloadBusy.value = false }
}
async function copyAll() {
  try { await navigator.clipboard.writeText(paragraphs.value.map(p => p.text).join('\n')) }
  catch { error.value = '复制失败，请手动选择内容复制' }
}
function printPdf() { window.print() }
function reset() { importController?.abort(); file.value = null; format.value = ''; pdfAvatar.value = null; paragraphs.value = []; proposed.value = ''; selectedId.value = null; error.value = '' }
</script>
<template>
  <AppShell><template #title>上传简历并润色</template>
    <div class="page-heading"><span class="eyebrow">DOCUMENT POLISHING</span><h1>让现有简历表达更出色</h1><p>保留你的事实内容，逐段提出改进建议。每一项修改都由你最终确认。</p></div>
    <div v-if="error" class="alert-error" role="alert">{{ error }}</div>
    <div v-if="!file" class="upload-zone"><UploadCloud :size="40" /><h2>导入已有简历</h2><p>支持 PDF 与 DOCX，最大 10MB。文件在浏览器解析，不自动上传到服务器。</p><label class="button button-primary upload-button"><input type="file" class="sr-only" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" :disabled="uploadBusy" @change="upload" />{{ uploadBusy ? '正在提取文本…' : '选择简历文件' }}</label><small>PDF 上传无法解析图片，如需头像请重新上传图片。扫描版 PDF 暂不支持 OCR。</small></div>
    <template v-else>
      <div class="import-file-info"><div class="import-filename"><FileText :size="19" /><div><strong>{{ file.name }}</strong><small>{{ paragraphs.length }} 段可编辑内容 · 已修改 {{ changed }} 段</small></div></div><button class="button" @click="reset"><ArrowLeft :size="15" /> 更换文件</button></div>
      <div class="notice-inline" v-if="format === 'pdf'">PDF 上传无法解析图片，如需头像请重新上传图片。导出 PDF 会重新排版文字及你上传的头像，不保留原图片和版式。</div>
      <div class="notice-inline" v-else>当前仅展示 DOCX 文字，不提取或编辑原头像和图片。导出时保留原文件中的图片资源，但文字修改可能影响图片位置、换行和分页；导出后请用 Word 检查。</div>
      <div v-if="format === 'pdf'" class="import-avatar-upload"><AvatarUpload v-model="pdfAvatar" /></div>
      <div v-if="paragraphs.length" class="import-layout">
        <aside class="paragraph-list"><h3>文档段落</h3><button v-for="p in paragraphs" :key="p.id" class="paragraph-item" :class="{ active: p.id === selectedId, modified: p.text !== p.original }" @click="select(p.id)"><span>{{ p.text.slice(0, 78) || '空段落' }}</span><small v-if="p.text !== p.original">已修改</small></button></aside>
        <section v-if="current" class="paragraph-workspace"><h3>原文与修改</h3><label class="field">当前文案 <textarea v-model="current.text" rows="7" maxlength="12000" placeholder="可直接修改文本" /></label>
          <div class="ai-polish-box"><div class="ai-polish-header"><strong><Sparkles :size="17" /> AI 优化</strong><NuxtLink v-if="!settings.apiKey" to="/settings" class="tiny-link">配置 API Key</NuxtLink></div>
            <div class="ai-control-row"><select v-model="instruction" aria-label="润色方式"><option value="professional">专业润色</option><option value="concise">精简表达</option><option value="clarity">语法修正</option><option value="jd">目标岗位匹配</option></select><button class="button button-primary small-button" :disabled="aiBusy || !settings.apiKey || !current.text.trim()" @click="runAi">{{ aiBusy ? '正在润色…' : '生成优化建议' }}</button></div>
            <textarea v-if="instruction === 'jd'" v-model="jobDescription" rows="4" placeholder="粘贴岗位 JD" maxlength="6000" />
            <div v-if="proposed" class="ai-proposal"><div class="ai-proposal-title">待确认修改</div><p>{{ proposed }}</p><div class="row-actions"><button class="button button-primary small-button" @click="apply"><Check :size="15" /> 采用建议</button><button class="button small-button" @click="proposed = ''"><X :size="15" /> 放弃</button></div></div>
            <p v-else class="muted small">未配置 AI 时，你仍可手动修改文案。AI 不会自动覆盖原文。</p>
          </div>
          <div class="paragraph-original"><strong>原始内容（对照）</strong><p>{{ current.original }}</p></div>
        </section>
      </div>
      <div v-if="paragraphs.length" class="import-export"><button v-if="format === 'docx'" class="button button-primary" :disabled="downloadBusy" @click="exportDocx"><Download :size="16" /> {{ downloadBusy ? '正在导出…' : '下载优化后的 DOCX' }}</button><button v-else class="button button-primary" @click="printPdf"><Printer :size="16" /> 打印 / 保存为 PDF（重排）</button><button class="button" @click="copyAll"><ClipboardCopy :size="16" /> 复制全部文案</button></div>
      <div class="polish-print-content"><div class="polish-print-heading"><h1>{{ file.name.replace(/\.pdf$/i, '') }}</h1><img v-if="pdfAvatar" :src="pdfAvatar" alt="简历头像" width="90" height="120" /></div><p v-for="p in paragraphs" :key="p.id">{{ p.text }}</p></div>
    </template>
  </AppShell>
</template>
