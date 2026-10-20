<script setup lang="ts">
import { Sun, Moon, Monitor } from 'lucide-vue-next'
import type { ThemePreference } from '~/composables/useTheme'
const theme = useTheme()
const options: { value: ThemePreference; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: '浅色', icon: Sun },
  { value: 'dark', label: '深色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor }
]
</script>

<template>
  <div class="theme-switcher" role="group" aria-label="外观模式">
    <button v-for="option in options" :key="option.value" type="button"
      :aria-pressed="theme === option.value" :aria-label="option.label" :title="option.label"
      :class="{ selected: theme === option.value }" @click="theme = option.value">
      <component :is="option.icon" :size="15" /><span>{{ option.label }}</span>
    </button>
  </div>
</template>
