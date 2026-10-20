import { defineStore } from 'pinia'
import { createResume, newId, type ResumeData, type TemplateId } from '~/types/resume'
import { loadLatestResume, persistResume, listResumes, removeResume } from '~/utils/storage'

export const useResumeStore = defineStore('resume', {
  state: () => ({
    resume: createResume() as ResumeData,
    ready: false,
    saving: false,
    savedAt: ''
  }),
  actions: {
    async initialize() {
      if (this.ready || !import.meta.client) return
      try {
        const previous = await loadLatestResume()
        if (previous) this.resume = previous
      } catch (err) {
        console.warn('浏览器本地存储不可用；本次会话仍可编辑。', err)
      } finally {
        this.ready = true
      }
    },
    async save() {
      if (!import.meta.client || !this.ready) return
      this.saving = true
      try {
        this.resume.updatedAt = new Date().toISOString()
        await persistResume(this.resume)
        this.savedAt = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      } finally { this.saving = false }
    },
    async newResume() {
      this.resume = createResume()
      await this.save()
    },
    async switchResume(id: string) {
      const all = await listResumes()
      const selected = all.find(r => r.id === id)
      if (selected) this.resume = selected
    },
    async duplicate() {
      this.resume = { ...structuredClone(this.resume), id: newId(), updatedAt: new Date().toISOString() }
      await this.save()
    },
    async deleteCurrent() {
      await removeResume(this.resume.id)
      const others = await listResumes()
      this.resume = others[0] ?? createResume()
      if (!others.length) await this.save()
    },
    setTemplate(id: TemplateId) { this.resume.template = id },
    addExperience() { this.resume.experiences.push({ id: newId(), company: '', role: '', period: '', description: '' }) },
    addEducation() { this.resume.education.push({ id: newId(), school: '', degree: '', period: '', description: '' }) },
    addProject() { this.resume.projects.push({ id: newId(), name: '', role: '', period: '', description: '' }) }
  }
})
