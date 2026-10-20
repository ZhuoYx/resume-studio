# 仓库及开发环境

本地项目已初始化 Git，`origin` 已配置为 `https://github.com/ZhuoYx/resume-studio.git`。不需要重复创建仓库或再次 `git init`。远程发布状态以 GitHub 实际状态为准。

## 开发与验证

建议使用 Node.js 24 LTS（≥ 24.11）与 pnpm。现有依赖锁文件为 `pnpm-lock.yaml`，请一并纳入提交，避免混用 npm 锁文件。

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm check:structure
pnpm typecheck
pnpm test:ai
pnpm build
```

本机最新检查结果和已知告警见 [VERIFICATION.md](VERIFICATION.md)。CI 和完整发布验收尚未完成。

不要提交本地 `.env` 文件、API Key、用户简历文件或浏览器 IndexedDB 数据。AI 密钥只保留在页面会话内存中；主题 Cookie 只保存外观偏好。
