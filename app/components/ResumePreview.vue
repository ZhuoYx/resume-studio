<script setup lang="ts">
import type { ResumeData } from '~/types/resume'
import { avatarSource } from '~/utils/avatar'
const props = defineProps<{ resume: ResumeData }>()
const avatar = computed(() => avatarSource(props.resume.profile.avatar))
const themeTitle = computed(() => ({ minimal: '简历', business: 'RESUME', graduate: '个人简历', engineer: 'ENGINEER PROFILE' })[props.resume.template])
const sections = computed(() => {
  const data = props.resume
  const rows = [
    { key: 'experience', title: '工作经历', entries: data.experiences.map(x => ({ heading: [x.company, x.role].filter(Boolean).join('  ·  '), period: x.period, description: x.description })) },
    { key: 'projects', title: '项目经历', entries: data.projects.map(x => ({ heading: [x.name, x.role].filter(Boolean).join('  ·  '), period: x.period, description: x.description })) },
    { key: 'education', title: '教育经历', entries: data.education.map(x => ({ heading: [x.school, x.degree].filter(Boolean).join('  ·  '), period: x.period, description: x.description })) }
  ]
  return props.resume.template === 'graduate' ? [rows[2]!, rows[1]!, rows[0]!] : props.resume.template === 'engineer' ? [rows[1]!, rows[0]!, rows[2]!] : rows
})
</script>
<template>
  <article class="resume-paper" :class="`resume-${resume.template}`" aria-label="简历 A4 预览">
    <div class="resume-accent" />
    <div class="resume-header" :class="{ 'has-avatar': avatar }">
      <div class="resume-heading">
        <div class="resume-kicker">{{ themeTitle }}</div>
        <h1>{{ resume.profile.name || '你的姓名' }}</h1>
        <div class="resume-role">{{ resume.profile.title || '目标职位 / 专业方向' }}</div>
        <div class="resume-contact">
          <span v-for="(part, idx) in [resume.profile.phone, resume.profile.email, resume.profile.location, resume.profile.website].filter(Boolean)" :key="idx">{{ part }}</span>
          <span v-if="![resume.profile.phone, resume.profile.email, resume.profile.location, resume.profile.website].some(Boolean)">联系方式 · 电子邮箱 · 所在城市</span>
        </div>
      </div>
      <img v-if="avatar" class="resume-avatar" :src="avatar" alt="简历照片" width="90" height="120" />
    </div>
    <div class="resume-body">
      <section v-if="resume.profile.summary.trim()" class="resume-section">
        <h2>个人简介</h2><p>{{ resume.profile.summary }}</p>
      </section>
      <section v-for="section in sections" v-show="section.entries.length" :key="section.key" class="resume-section">
        <h2>{{ section.title }}</h2>
        <div v-for="(entry, idx) in section.entries" :key="idx" class="resume-entry">
          <div class="entry-header"><strong>{{ entry.heading || '未命名条目' }}</strong><span>{{ entry.period }}</span></div>
          <p>{{ entry.description }}</p>
        </div>
      </section>
      <section v-if="resume.skills.trim()" class="resume-section"><h2>专业技能</h2><p>{{ resume.skills }}</p></section>
      <div v-if="!resume.profile.summary && !resume.experiences.length && !resume.projects.length && !resume.education.length && !resume.skills" class="preview-hint">
        <strong>你的故事，从这里开始。</strong><p>填写左侧信息，这里会实时呈现简历效果。</p>
      </div>
    </div>
  </article>
</template>
