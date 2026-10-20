<script setup lang="ts">
import { FileUser, LayoutDashboard, PenLine, FileUp, Settings2, Github, Menu, X, KeyRound, ChevronRight } from 'lucide-vue-next'
import { providerLabels } from '~/composables/useAiSettings'
const settings = useAiSettings()
const hasApiKey = computed(() => Boolean(settings.value.apiKey.trim()))
const mobileOpen = ref(false)
const links = [
  { to: '/', label: '工作台', icon: LayoutDashboard },
  { to: '/editor', label: '创建简历', icon: PenLine },
  { to: '/import', label: '上传润色', icon: FileUp },
  { to: '/settings', label: 'AI 设置', icon: Settings2 }
]
const route = useRoute()
watch(() => route.path, () => { mobileOpen.value = false })
</script>
<template>
  <div class="app-root" @keydown.esc="mobileOpen = false">
    <aside id="main-navigation" class="sidebar" :class="{ 'sidebar-open': mobileOpen }" aria-label="主导航">
      <NuxtLink to="/" class="brand"><span class="brand-logo"><FileUser :size="21" /></span><span>Resume<span class="brand-light">Studio</span><small>简历工作台</small></span></NuxtLink>
      <div class="sidebar-subtitle">WORKSPACE</div>
      <nav class="nav-list">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link" :class="{ active: route.path === link.to }">
          <component :is="link.icon" :size="18" /><span>{{ link.label }}</span>
        </NuxtLink>
      </nav>
      <div class="sidebar-bottom">
        <NuxtLink to="/settings" class="api-status" :class="{ configured: hasApiKey }">
          <span class="api-status-icon"><KeyRound :size="18" /></span>
          <span class="api-status-copy" aria-live="polite"><strong>{{ hasApiKey ? 'API Key 已配置' : 'API Key 未配置' }}</strong><small>{{ hasApiKey ? `${providerLabels[settings.provider]} · 当前会话` : '连接 AI，开启文案润色' }}</small></span>
          <ChevronRight :size="15" />
        </NuxtLink>
        <a href="https://github.com/ZhuoYx" target="_blank" rel="noopener noreferrer" class="github-link"><Github :size="16" /> GitHub 主页</a>
      </div>
    </aside>
    <button v-if="mobileOpen" type="button" class="mobile-backdrop" aria-label="关闭导航" @click="mobileOpen = false" />
    <div class="main-area">
      <header class="topbar">
        <button type="button" class="icon-button mobile-menu" :aria-label="mobileOpen ? '关闭导航' : '展开导航'" :aria-expanded="mobileOpen" aria-controls="main-navigation" @click="mobileOpen = !mobileOpen">
          <X v-if="mobileOpen" :size="22" /><Menu v-else :size="22" />
        </button>
        <div class="topbar-title"><slot name="title">智能简历工作台</slot></div>
        <div class="topbar-right"><ThemeSwitcher /><span class="topbar-version">V1 · BETA</span></div>
      </header>
      <main class="main-content"><slot /></main>
    </div>
  </div>
</template>
