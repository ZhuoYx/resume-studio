export default defineNuxtConfig({
  compatibilityDate: '2026-01-01',
  modules: ['@pinia/nuxt'],
  css: ['~/assets/css/main.css'],
  typescript: { strict: true },
  app: {
    head: {
      title: 'Resume Studio · 智能简历工作台',
      meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '开源、隐私优先的简历编辑与 AI 润色工具' }],
      htmlAttrs: { lang: 'zh-CN' }
    }
  },
  routeRules: { '/api/**': { cors: false, headers: { 'Cache-Control': 'no-store' } } }
})
