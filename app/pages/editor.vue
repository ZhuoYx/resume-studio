<script setup lang="ts">
import { Download, Printer, Save, LayoutTemplate, PanelLeft, Eye, ChevronDown } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useAutosave } from '~/composables/useAutosave'
import { templateCatalog, type TemplateId } from '~/types/resume'
import { exportResumeDocx } from '~/utils/documents'
const store = useAutosave()
const { resume } = storeToRefs(store)
const activeMobile = ref<'edit'|'preview'>('edit')
const zoom = ref(0.72)
const exporting = ref(false)
const error = ref('')
onMounted(() => { if (window.innerWidth <= 700) zoom.value = 0.39 })
async function toDocx() { exporting.value = true; error.value = ''; try { await exportResumeDocx(resume.value) } catch (e: any) { error.value = e?.message ?? 'DOCX 导出失败' } finally { exporting.value = false } }
function toPdf() { window.print() }
const zoomStyle = computed(() => ({ '--resume-zoom': String(zoom.value), '--scaled-width': `${794 * zoom.value}px`, '--scaled-height': `${1123 * zoom.value}px` }))
</script>
<template>
  <AppShell><template #title>简历编辑器</template>
    <div class="editor-toolbar">
      <div class="editor-toolbar-heading"><h1>编辑你的简历</h1><span class="saved-indicator"><Save :size="14" /> {{ store.saving ? '保存中…' : store.savedAt ? `已保存 ${store.savedAt}` : '本地自动保存' }}</span></div>
      <div class="toolbar-actions"><button class="button" :disabled="exporting" @click="toDocx"><Download :size="16" /> {{ exporting ? '导出中…' : '导出 DOCX' }}</button><button class="button button-primary" @click="toPdf"><Printer :size="16" /> PDF / 打印</button></div>
    </div>
    <div v-if="error" class="alert-error" role="alert">{{ error }}</div>
    <div class="mobile-editor-tabs"><button :class="{ selected: activeMobile === 'edit' }" @click="activeMobile = 'edit'"><PanelLeft :size="16" /> 编辑内容</button><button :class="{ selected: activeMobile === 'preview' }" @click="activeMobile = 'preview'"><Eye :size="16" /> 简历预览</button></div>
    <div class="editor-layout">
      <section class="editor-panel" :class="{ 'mobile-hidden': activeMobile !== 'edit' }" aria-label="结构化简历编辑"><ResumeForm /></section>
      <section class="preview-panel" :class="{ 'mobile-hidden': activeMobile !== 'preview' }" aria-label="简历实时预览">
        <div class="preview-topline"><strong><LayoutTemplate :size="17" /> 简历模板</strong><span class="muted small">官方精选 · 仅可切换</span></div>
        <div class="template-options"><button v-for="t in templateCatalog" :key="t.id" class="template-pill" :class="{ chosen: resume.template === t.id }" :title="t.description" @click="store.setTemplate(t.id as TemplateId)">{{ t.name }}</button></div>
        <div class="preview-controls"><span>A4 实时预览</span><label>缩放 <input v-model.number="zoom" type="range" min="0.3" max="1" step="0.05" /> {{ Math.round(zoom * 100) }}%</label></div>
        <div class="preview-stage"><div class="preview-scaled" :style="zoomStyle"><div class="print-target" :style="{ transform: `scale(${zoom})` }"><ResumePreview :resume="resume" /></div></div></div>
        <p class="preview-note">导出 PDF 将打开系统打印对话框，选择「保存为 PDF」。页面较长时请检查分页效果。</p>
      </section>
    </div>
  </AppShell>
</template>
