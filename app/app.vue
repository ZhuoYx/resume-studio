<script setup lang="ts">
const theme = useTheme()
const themeCookie = useCookie<string>('resume-theme', { maxAge: 31536000, sameSite: 'lax', path: '/' })
watch(theme, value => { themeCookie.value = value })
useHead(() => ({ htmlAttrs: { 'data-theme': theme.value } }))
</script>

<template>
  <NuxtPage />
</template>
