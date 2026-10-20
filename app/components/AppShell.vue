<script setup lang="ts">
import { FileUser, LayoutDashboard, PenLine, FileUp, Settings2, Github, Menu, X } from 'lucide-vue-next'
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
  <div class="app-root">
    <aside class="sidebar" :class="{ 'sidebar-open': mobileOpen }" aria-label="主导航">
      <NuxtLink to="/" class="brand"><span class="brand-logo"><FileUser :size="21" /></span><span>Resume<span class="brand-light">Studio</span><small>简历工作台</small></span></NuxtLink>
      <div class="sidebar-subtitle">WORKSPACE</div>
      <nav class="nav-list">
        <NuxtLink v-for="link in links" :key="link.to" :to="link.to" class="nav-link" :class="{ active: route.path === link.to }">
          <component :is="link.icon" :size="18" /><span>{{ link.label }}</span>
        </NuxtLink>
      </nav>
      <div class="sidebar-bottom">
        <span class="privacy-mark">◉ 本地优先 · 无需登录</span>
        <a href="https://github.com/ZhuoYx" target="_blank" rel="noopener noreferrer" class="github-link"><Github :size="16" /> GitHub 主页</a>
      </div>
    </aside>
    <div v-if="mobileOpen" class="mobile-backdrop" @click="mobileOpen = false" />
    <div class="main-area">
      <header class="topbar">
        <button type="button" class="icon-button mobile-menu" :aria-label="mobileOpen ? '关闭导航' : '展开导航'" @click="mobileOpen = !mobileOpen">
          <X v-if="mobileOpen" :size="22" /><Menu v-else :size="22" />
        </button>
        <div class="topbar-title"><slot name="title">智能简历工作台</slot></div>
        <div class="topbar-right"><span class="topbar-version">V1 · BETA</span></div>
      </header>
      <main class="main-content"><slot /></main>
    </div>
  </div>
</template>
