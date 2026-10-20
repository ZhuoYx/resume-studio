import Dexie, { type Table } from 'dexie'
import { toRaw } from 'vue'
import type { ResumeData } from '~/types/resume'

class ResumeDatabase extends Dexie {
  resumes!: Table<ResumeData, string>
  constructor() {
    super('resume-studio-v1')
    this.version(1).stores({ resumes: 'id,updatedAt' })
  }
}
let database: ResumeDatabase | undefined
const db = () => database ?? (database = new ResumeDatabase())

export async function loadLatestResume(): Promise<ResumeData | undefined> {
  return db().resumes.orderBy('updatedAt').last()
}
export async function persistResume(resume: ResumeData): Promise<void> {
  await db().resumes.put(structuredClone(toRaw(resume)))
}
export async function listResumes(): Promise<ResumeData[]> {
  return db().resumes.orderBy('updatedAt').reverse().toArray()
}
export async function removeResume(id: string): Promise<void> {
  await db().resumes.delete(id)
}
