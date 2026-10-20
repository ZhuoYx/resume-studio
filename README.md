# Resume Studio / 智能简历工作台

> Nuxt 4 · Vue 3 · TypeScript · PC / Mobile · PDF / DOCX · Open Source

开源、无需注册、本地优先的简历编辑工具。支持官方固定简历模板、A4 实时预览、在线 AI 文案润色与对照确认，以及上传现有 PDF / DOCX 后逐段修改。

> **当前状态：V1 开发版，非完整稳定发布。** 已完成依赖安装、本机构建与本次界面功能检查；文档兼容性、真实 AI 调用、防滥用和完整双端验收仍待完成。检查结果及环境告警见 [验证记录](docs/VERIFICATION.md)，发布待办见 [V1 范围](docs/V1_SCOPE.md)。

## 本地运行（仅开发用途）

建议使用 Node.js 24 LTS（≥ 24.11）及 pnpm。当前锁定的 Nuxt 4.6.2 已不支持 Node 20。

```bash
pnpm install --frozen-lockfile
pnpm dev
# 打开 http://localhost:3000
```

检查构建：

```bash
pnpm typecheck
pnpm test:ai
pnpm build
```

当前 V1 不维护自部署安装包、Docker 和 Ollama 适配。上述仅为本地开发指令，非正式自部署支持。

## 两种工作模式

全站提供浅色、深色、跟随系统三种外观，默认跟随系统。外观偏好通过 Cookie 保存；简历预览与打印始终使用白纸配色。侧栏底部显示当前服务商的 API Key 填写状态，可直接进入 AI 设置；填写不代表已通过服务商验证。

### 1. 创建简历（`/editor`）

- 结构化编辑姓名、联系信息、工作经历、项目、教育和技能
- 可选上传简历照片（JPG / PNG / WebP，最大 5MB），在浏览器内居中裁成 3:4、压缩为 300×400 JPEG，支持更换或移除；随简历保存在 IndexedDB，四套模板预览、打印 PDF 与 DOCX 导出均包含照片。不上传不预留照片位置，兼容旧简历
- 选择四款**官方固定模板**：极简专业、现代商务、校园求职、技术工程师
- PC 分栏编辑+预览；移动端「编辑 / 预览」标签页
- 自动保存到浏览器 IndexedDB，支持多份简历与复制
- DOCX 下载；PDF 通过系统打印对话框「保存为 PDF」
- 可选 AI 文案润色，逐条接受或拒绝

### 2. 上传简历（`/import`）

- 支持 10MB 内 `.docx` 和文本型 `.pdf`，文件在**浏览器本地解析**
- 支持段落手动编辑、逐段 AI 润色、原文对照、改动审核
- DOCX：在原 OOXML 文档中局部替换文本，尽量保留段落/样式结构，**不保证**字符级格式或分页完全一致
- PDF：只提取文字，不解析图片。需要头像时请重新上传 JPG / PNG / WebP 图片（选填）；编辑后的文字和手动上传的头像可打印为**重新排版的 PDF**，不保留原 PDF 的图片和版式，**不提供原 PDF 原位置文本替换**
- 扫描版 PDF 暂不支持 OCR。导入 DOCX 尚不提取图片，原包导出保留原图片资源，但需核对位置

### AI 的安全边界

- **完全可选**：不输入 Key 也能手动操作和导出
- 支持 OpenAI、DeepSeek、Qwen、MiniMax；用户提供 API Key 和模型 ID
- MiniMax 接入中国区固定地址 `https://api.minimax.cn/v1/chat/completions`，默认 `MiniMax-M3.1-Flash`，模型 ID 可修改。参数依据 [MiniMax 官方文档](https://platform.minimax.cn/docs/api-reference/text-openai-api)，思考内容不会写入建议正文
- 切换服务商会清除旧 Key，避免跨平台误发；刷新页面后也需重新填写
- Key 只在当前浏览器会话的内存状态中暂存；不写入 `localStorage`、IndexedDB、源代码或服务器数据库
- 只有用户主动调用 AI 时，所选文本、Key 和模型参数才通过 Nuxt Nitro 代理发送给对应 AI 服务商
- 服务器转发请求仍然可能被网站运营方观察；请仅在可信站点填写 Key，建议使用单独、低额度 Key
- 代理使用固定服务商域名防 SSRF；基础参数限制与超时已实现，但**正式对外发布前仍须添加防滥用限流、部署安全策略和安全测试**
- 不会将文案建议静默写入简历；**禁止 AI 虚构项目、经历和业绩**

## 当前不包含

自定义模板、AI 生成模板、模板上传与社区、用户账号、云端同步、OCR、任意 PDF 高保真编辑、Ollama、自部署支持。

## 工程结构

```text
app/
  assets/css/main.css       页面视觉、响应式布局和 A4 打印样式
  components/              官方模板预览、结构化表单、AI 修改面板和导航
  composables/             会话内 AI 设置、自动保存
  pages/                   工作台 / 编辑 / 上传润色 / AI 设置
  stores/resume.ts         Pinia 简历状态
  types/resume.ts          简历模型与官方模板清单
  utils/                   IndexedDB、PDF/DOCX 文档处理和导出
server/api/ai/            Nitro AI 请求代理（固定服务商白名单）
docs/V1_SCOPE.md           范围、优先事项与验证清单
```

## 隐私与数据恢复

简历默认存在访问此网站的浏览器 IndexedDB 中；清理站点数据、隐私模式结束、换浏览器或换设备都可能造成数据丢失。目前尚未实现文件形式的完整简历备份/恢复；在此能力完成前不要依赖它存储唯一一份简历。建议另行保存导出的 DOCX。

## 贡献和许可

欢迎提交 Issue / Pull Request。V1 官方模板由维护者审核、统一维护；暂不接受运行时上传自定义模板。采用 [MIT 许可证](LICENSE)。
