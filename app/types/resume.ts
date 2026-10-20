export type TemplateId = 'minimal' | 'business' | 'graduate' | 'engineer'

export interface Profile {
  /** Optional, locally normalized JPEG data URL. Missing on older resumes. */
  avatar?: string | null
  name: string
  title: string
  email: string
  phone: string
  location: string
  website: string
  summary: string
}
export interface Experience {
  id: string
  company: string
  role: string
  period: string
  description: string
}
export interface Education {
  id: string
  school: string
  degree: string
  period: string
  description: string
}
export interface Project {
  id: string
  name: string
  role: string
  period: string
  description: string
}
export interface ResumeData {
  id: string
  updatedAt: string
  template: TemplateId
  profile: Profile
  experiences: Experience[]
  education: Education[]
  projects: Project[]
  skills: string
}
export const templateCatalog: { id: TemplateId; name: string; description: string }[] = [
  { id: 'minimal', name: '极简专业', description: '清爽单栏，适配各类岗位' },
  { id: 'business', name: '现代商务', description: '稳重蓝灰，清晰强调经历' },
  { id: 'graduate', name: '校园求职', description: '教育与项目优先' },
  { id: 'engineer', name: '技术工程师', description: '聚焦技能与项目成果' }
]
export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `item-${Math.random().toString(36).slice(2)}`
}
export function createResume(): ResumeData {
  return {
    id: newId(), updatedAt: new Date().toISOString(), template: 'minimal',
    profile: { avatar: null, name: '', title: '', email: '', phone: '', location: '', website: '', summary: '' },
    experiences: [], education: [], projects: [], skills: ''
  }
}
