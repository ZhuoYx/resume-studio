import { useResumeStore } from '~/stores/resume'

export function useAutosave() {
  const store = useResumeStore()
  let timer: ReturnType<typeof setTimeout> | undefined
  onMounted(async () => { await store.initialize() })
  watch(() => [store.resume.id, store.resume.template, store.resume.profile, store.resume.experiences, store.resume.education, store.resume.projects, store.resume.skills], () => {
    if (!store.ready || !import.meta.client) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => { store.save().catch(console.error) }, 700)
  }, { deep: true })
  onUnmounted(() => { if (timer) clearTimeout(timer) })
  return store
}
