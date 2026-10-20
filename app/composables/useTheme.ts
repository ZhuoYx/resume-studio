export type ThemePreference = 'light' | 'dark' | 'system'

export function useTheme() {
  return useState<ThemePreference>('theme-preference', () => {
    const cookie = useCookie<string>('resume-theme', { readonly: true })
    return cookie.value === 'light' || cookie.value === 'dark' ? cookie.value : 'system'
  })
}
