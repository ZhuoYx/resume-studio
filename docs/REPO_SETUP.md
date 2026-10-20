# GitHub 仓库初始化说明

本项目目前只打包在本地，并**尚未在 GitHub 上创建远程仓库**。仓库创建需由已登录 GitHub 的用户完成。

1. 访问 https://github.com/new ，在个人账号 `ZhuoYx` 下创建名为 `resume-studio` 的 **Public** 空仓库（建议不要在网页勾选额外 README、LICENSE 或 .gitignore，项目中已有这些文件）。
2. 将交付压缩包解压到自己的开发目录，在该目录运行：

```bash
git init -b main
git add .
git commit -m "feat: initialize responsive Nuxt resume studio"
git remote add origin https://github.com/ZhuoYx/resume-studio.git
git push -u origin main
```

3. 为避免泄漏密钥，不要提交本地 `.env` 文件、API Key、用户简历文件或浏览器 IndexedDB 数据。
4. 克隆后在可访问 npm 的环境运行 `npm install && npm run check:structure && npm run typecheck && npm run build`。首次安装完成后，建议提交生成的 `package-lock.json` 并在 CI 中改用 `npm ci`。

若仓库实际使用其他名字，请同步修改 `git remote` URL。若已在本会话中将 GitHub 仓库链接发给助理，可继续通过已连接的 GitHub 工具提交文件，无需手动复制粘贴代码。
