# V1 已确认需求及实现跟踪

## 产品基准

- 开源（MIT），暂不承担生产自部署支持，只计划维护官方在线版本
- Nuxt 4 + Vue 3 + TypeScript，PC 和移动端都必须具备完整使用路径
- **两种模式：**（A）上传 PDF/DOCX 进行原文对照 AI 润色；（B）结构化表单创建/编辑，使用平台固定模板
- 仅官方内置模板，用户不能自行创建、生成、导入、上传、编辑或分享模板
- 不要求登录，不配置 AI 也可以手动编辑、切换模板与导出
- 用户 BYOK，固定在线模型服务商，经 Nitro 代理；暂不提供 Ollama
- 简历数据尽量保留在浏览器，AI 请求需用户主动发起

## 已在源代码实现（仍待安装依赖和实际集成验收）

- [x] Nuxt / Vue / TypeScript 项目结构和中文 UI
- [x] 首页简历列表、创建、复制、删除、打开
- [x] Pinia 结构化简历、IndexedDB 保存和自动保存机制
- [x] 四套官方模板及 A4 预览设计
- [x] PC 多栏与移动端单栏/切换视图
- [x] PDF 文本层读取；DOCX OOXML 段落读取
- [x] 上传文档按段对照、手动修改、接受/拒绝 AI 建议
- [x] DOCX 原包局部文字替换导出（有限保真）
- [x] 编辑模式 DOCX 导出；浏览器打印 PDF
- [x] AI 会话配置和 Nitro 固定域名代理（OpenAI/DeepSeek/Qwen）

## 发布前必须完成

- [ ] 在联网 CI 环境 `npm install`、`npm run typecheck`、`npm run build`；提交 lockfile
- [ ] Desktop Chrome/Edge、Mobile Safari/Chrome 实测上传、编辑、预览和导出
- [ ] Word/WPS/LibreOffice 文档样例兼容测试：表格、run 分割、页眉页脚、分页、混合字体
- [ ] PDF 的长文档、多栏文本、非文本扫描件错误提示和打印分页验证
- [ ] 防止公共 AI 代理被批量滥用（用户/IP 速率限制、请求体大小、日志脱敏、成本限制）
- [ ] 正式站点配置 HTTPS、CSP、安全响应头和上传大小限制
- [ ] 增加可下载的简历 JSON 备份与恢复（本地自动保存不等于可靠备份）
- [ ] 确认官方模板的 DOCX/PDF 外观一致性及 ATS 可读性
- [ ] 改进失败状态、键盘可访问性、无障碍和打印质量
- [ ] 添加 Vitest 组件测试、Playwright 双端端到端测试、GitHub Actions

## 明确不在 V1 中

自定义/AI 模板、用户模板服务器上传、登录、在线同步、OCR、任意 PDF 原格式文本重写、支持 Ollama、本地 AI、自部署文档、云端存储简历。
