<script setup lang="ts">
import { FileUp, PenLine, ArrowRight, ShieldCheck, Layers3, Sparkles, Clock3, FileText, Trash2, Copy } from 'lucide-vue-next'
import { useResumeStore } from '~/stores/resume'
import { listResumes } from '~/utils/storage'
import type { ResumeData } from '~/types/resume'
const store = useResumeStore()
const resumes = ref<ResumeData[]>([])
const loading = ref(true)
async function refresh() {
  try { resumes.value = await listResumes() }
  catch { resumes.value = [] }
  finally { loading.value = false }
}
onMounted(async () => { await store.initialize(); await refresh() })
async function createNew() { await store.newResume(); await navigateTo('/editor') }
async function openResume(id: string) { await store.switchResume(id); await navigateTo('/editor') }
async function removeDraft(id: string) {
  if (!window.confirm('确定删除这份简历吗？此操作无法撤销。')) return
  if (store.resume.id === id) await store.deleteCurrent()
  else { const { removeResume } = await import('~/utils/storage'); await removeResume(id) }
  await refresh()
}
async function duplicate(id: string) { await store.switchResume(id); await store.duplicate(); await refresh() }
</script>
<template>
  <AppShell><template #title>工作台</template>
    <div class="dashboard-intro"><span class="eyebrow">YOUR CAREER, BETTER PRESENTED</span><h1>让每一份经历，<br class="mobile-only" />都被更好地看见<span class="accent-dot">.</span></h1><p>无需注册，轻松创建、优化和管理你的简历。专业模板、实时预览，以及可选的 AI 写作辅助。</p></div>
    <div class="action-grid">
      <button class="action-card primary-action" type="button" @click="createNew">
        <span class="action-icon"><PenLine :size="24" /></span><span class="action-text"><strong>从零创建简历</strong><small>使用专业模板，从基本信息开始</small></span><ArrowRight :size="21" class="action-arrow" />
      </button>
      <NuxtLink to="/import" class="action-card"><span class="action-icon"><FileUp :size="24" /></span><span class="action-text"><strong>上传简历并优化</strong><small>导入 PDF / DOCX，改善文案表达</small></span><ArrowRight :size="21" class="action-arrow" /></NuxtLink>
    </div>
    <div class="benefits"><span><ShieldCheck :size="17" /> 本地优先，保护隐私</span><span><Layers3 :size="17" /> 4 款精选官方模板</span><span><Sparkles :size="17" /> AI 功能按需启用</span></div>
    <section class="dashboard-section">
      <div class="section-heading"><div><span class="eyebrow">RECENT ACTIVITY</span><h2>我的简历</h2></div><span class="muted small">保存在当前浏览器中</span></div>
      <div v-if="loading" class="empty-state">正在读取本地简历…</div>
      <div v-else-if="!resumes.length" class="empty-state"><FileText :size="32" /><strong>还没有保存的简历</strong><p>创建一份简历，即可在这里继续编辑。</p></div>
      <div v-else class="draft-grid">
        <article v-for="resume in resumes" :key="resume.id" class="draft-card">
          <div class="draft-icon"><FileText :size="23" /></div><strong>{{ resume.profile.name || '未命名简历' }}</strong><span class="muted small">{{ resume.profile.title || '尚未填写求职职位' }}</span>
          <span class="draft-date"><Clock3 :size="14" /> {{ new Date(resume.updatedAt).toLocaleDateString('zh-CN') }}</span>
          <div class="draft-actions"><button class="button button-primary small-button" @click="openResume(resume.id)">继续编辑</button><button class="icon-button" title="复制简历" aria-label="复制简历" @click="duplicate(resume.id)"><Copy :size="16" /></button><button class="icon-button danger-text" title="删除简历" aria-label="删除简历" @click="removeDraft(resume.id)"><Trash2 :size="16" /></button></div>
        </article>
      </div>
    </section>
  </AppShell>
</template>
