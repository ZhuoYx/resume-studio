<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { useResumeStore } from '~/stores/resume'
const store = useResumeStore()
const { resume } = storeToRefs(store)
const active = ref<'profile' | 'experience' | 'projects' | 'education' | 'skills'>('profile')
const tabs: { id: typeof active.value; label: string }[] = [
  { id: 'profile', label: '基本信息' }, { id: 'experience', label: '工作经历' },
  { id: 'projects', label: '项目经历' }, { id: 'education', label: '教育经历' }, { id: 'skills', label: '专业技能' }
]
</script>
<template>
  <div class="resume-form">
    <div class="form-tabs" role="tablist" aria-label="编辑简历部分">
      <button v-for="tab in tabs" :key="tab.id" type="button" class="form-tab" :class="{ active: active === tab.id }" @click="active = tab.id">{{ tab.label }}</button>
    </div>
    <div v-if="active === 'profile'" class="form-content">
      <h3>基本信息</h3><p class="muted small">完善个人信息，预览区域会实时同步。</p>
      <div class="field-grid">
        <label class="field">姓名 <input v-model="resume.profile.name" placeholder="如：张三" maxlength="80" /></label>
        <label class="field">求职职位 <input v-model="resume.profile.title" placeholder="如：前端开发工程师" maxlength="100" /></label>
        <label class="field">电子邮箱 <input v-model="resume.profile.email" type="email" placeholder="name@example.com" maxlength="120" /></label>
        <label class="field">联系电话 <input v-model="resume.profile.phone" type="tel" placeholder="联系电话" maxlength="40" /></label>
        <label class="field">所在城市 <input v-model="resume.profile.location" placeholder="如：上海" maxlength="80" /></label>
        <label class="field">个人网站 <input v-model="resume.profile.website" placeholder="个人主页 / 作品链接" maxlength="200" /></label>
      </div>
      <label class="field">个人简介 <textarea v-model="resume.profile.summary" rows="5" maxlength="2500" placeholder="简单介绍你的工作经验、核心能力与职业目标" /></label><AiPolishPanel v-model="resume.profile.summary" />
    </div>
    <div v-else-if="active === 'experience'" class="form-content">
      <div class="section-heading"><h3>工作经历</h3><button class="button small-button" @click="store.addExperience"><Plus :size="15" /> 添加经历</button></div>
      <p v-if="!resume.experiences.length" class="empty-note">暂未添加工作经历</p>
      <div v-for="(item, index) in resume.experiences" :key="item.id" class="entry-form">
        <div class="entry-form-title">经历 {{ index + 1 }} <button class="delete-button" aria-label="删除工作经历" @click="resume.experiences.splice(index, 1)"><Trash2 :size="16" /></button></div>
        <div class="field-grid"><label class="field">公司 <input v-model="item.company" placeholder="公司名称" /></label><label class="field">职位 <input v-model="item.role" placeholder="职位名称" /></label></div>
        <label class="field">任职时间 <input v-model="item.period" placeholder="2022.03 - 至今" /></label>
        <label class="field">工作内容 <textarea v-model="item.description" rows="5" placeholder="描述负责的工作、项目与真实成果" /></label><AiPolishPanel v-model="item.description" />
      </div>
    </div>
    <div v-else-if="active === 'projects'" class="form-content">
      <div class="section-heading"><h3>项目经历</h3><button class="button small-button" @click="store.addProject"><Plus :size="15" /> 添加项目</button></div>
      <p v-if="!resume.projects.length" class="empty-note">暂未添加项目经历</p>
      <div v-for="(item, index) in resume.projects" :key="item.id" class="entry-form">
        <div class="entry-form-title">项目 {{ index + 1 }} <button class="delete-button" aria-label="删除项目" @click="resume.projects.splice(index, 1)"><Trash2 :size="16" /></button></div>
        <div class="field-grid"><label class="field">项目名称 <input v-model="item.name" placeholder="项目名称" /></label><label class="field">担任角色 <input v-model="item.role" placeholder="负责角色" /></label></div>
        <label class="field">项目时间 <input v-model="item.period" placeholder="2023.01 - 2023.09" /></label>
        <label class="field">项目描述 <textarea v-model="item.description" rows="5" placeholder="技术方案、本人贡献、量化成果（需真实）" /></label><AiPolishPanel v-model="item.description" />
      </div>
    </div>
    <div v-else-if="active === 'education'" class="form-content">
      <div class="section-heading"><h3>教育经历</h3><button class="button small-button" @click="store.addEducation"><Plus :size="15" /> 添加教育</button></div>
      <p v-if="!resume.education.length" class="empty-note">暂未添加教育经历</p>
      <div v-for="(item, index) in resume.education" :key="item.id" class="entry-form">
        <div class="entry-form-title">教育 {{ index + 1 }} <button class="delete-button" aria-label="删除教育经历" @click="resume.education.splice(index, 1)"><Trash2 :size="16" /></button></div>
        <div class="field-grid"><label class="field">学校 <input v-model="item.school" placeholder="学校名称" /></label><label class="field">专业 / 学位 <input v-model="item.degree" placeholder="专业 · 学位" /></label></div>
        <label class="field">就读时间 <input v-model="item.period" placeholder="2018.09 - 2022.06" /></label>
        <label class="field">补充信息 <textarea v-model="item.description" rows="3" placeholder="荣誉、课程、竞赛等" /></label>
      </div>
    </div>
    <div v-else class="form-content"><h3>专业技能</h3><label class="field">技能描述 <textarea v-model="resume.skills" rows="9" placeholder="例如：Vue 3、TypeScript、Nuxt、性能优化……" /></label><AiPolishPanel v-model="resume.skills" /></div>
  </div>
</template>
