# Nanobanana - 基于 OpenRouter 的图片生成 Web UI

这是一个现代化的 Web 应用，使用 Vue3 + TypeScript + TailwindCSS 构建，直接调用 OpenRouter API 进行图片生成和多模态对话。

## 核心功能

### ✨ Web UI 功能

-   **多图上传**: 支持拖拽或点击上传多张本地图片，实时预览缩略图
-   **智能对话**: 输入文本提示词，结合上传的图片与 AI 进行多模态对话
-   **直接集成**: 前端直接调用 OpenRouter API，无需中间服务器
-   **现代化界面**: 使用 TailwindCSS 构建的响应式暗色主题界面
-   **实时反馈**: 加载状态、错误处理和结果展示
-   **类型安全**: 完整的 TypeScript 支持

### 🆕 新增特性

-   **文生图创作**: 新增独立的文字转图片流程，可直接输入文本描述生成图片，生成结果支持下载或继续二次创作
-   **自定义端点与模型**: 支持填写自定义 API 端点，自行获取并选择可用模型，并记住你的首选配置
-   **多渠道兼容**: 在保留 OpenRouter API 的同时，也完美适配 CLIProxyAPI，可直接调用通过 CLIProxyAPI 部署的 NanoBanana 模型

## 为何使用本项目？

-   **纯前端应用**: 无需部署后端服务器，直接托管静态文件即可
-   **现代化技术栈**: Vue3 + TypeScript + TailwindCSS，开发体验优秀
-   **直接调用**: 前端直接调用 OpenRouter API，减少中间环节
-   **易于部署**: 可部署到任何静态托管服务（Vercel、Netlify、GitHub Pages 等）

## 技术栈

-   **前端**: Vue 3 + TypeScript + TailwindCSS + Vite
-   **构建工具**: Vite (快速开发和构建)
-   **样式**: TailwindCSS (原子化 CSS 框架)
-   **AI 模型**: 直接调用 OpenRouter API，默认使用 `google/gemini-2.5-flash-image-preview:free`

## 本地开发

### 前置要求

-   Node.js 18+
-   npm 或 yarn

### 开发环境启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 http://localhost:3000 即可使用应用。

### 生产构建

```bash
# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 部署

### 部署到 Vercel

1. Fork 本项目到您的 GitHub
2. 在 [Vercel](https://vercel.com) 中导入项目
3. Vercel 会自动检测为 Vite 项目并部署

### 部署到 Netlify

1. Fork 本项目到您的 GitHub
2. 在 [Netlify](https://netlify.com) 中连接 GitHub 仓库
3. 构建命令: `npm run build`
4. 发布目录: `dist`

### 部署到 GitHub Pages

1. Fork 本项目
2. 在项目设置中启用 GitHub Pages
3. 使用 GitHub Actions 自动构建和部署

### 部署到 Cloudflare Pages

1. Fork 本项目到您的 GitHub
2. 在 [Cloudflare Pages](https://http://www.cloudflare.com/) 中连接 GitHub 仓库
3. 构建命令: `npm run build`
4. 发布目录: `dist`

### 其他静态托管服务

本项目构建后生成纯静态文件，可以部署到任何静态托管服务：

-   Firebase Hosting
-   AWS S3 + CloudFront
-   等等

## 如何使用

1. 打开部署后的网站
2. 在 "设置" 部分输入您的 OpenRouter API Key
3. 上传一张或多张图片（支持拖拽）
4. 输入文本提示词，描述您想要的内容
5. 点击 "生成" 按钮
6. 等待 AI 生成结果

## 获取 OpenRouter API Key

1. 访问 [OpenRouter](https://openrouter.ai/)
2. 注册账号并登录
3. 在 API Keys 页面创建新的 API Key
4. 将 API Key 输入到应用中即可使用

## 项目结构

```
src/
├── components/          # Vue 组件
│   ├── ApiKeyInput.vue     # API Key 输入组件
│   ├── ImageUpload.vue     # 图片上传组件
│   ├── PromptInput.vue     # 提示词输入组件
│   ├── GenerateButton.vue  # 生成按钮组件
│   └── ResultDisplay.vue   # 结果展示组件
├── services/           # API 服务
│   └── api.ts             # OpenRouter API 调用
├── types/              # TypeScript 类型定义
│   └── index.ts
├── App.vue             # 主应用组件
├── main.ts             # 应用入口
└── style.css           # TailwindCSS 样式
```

## 开发说明

-   使用 Vue 3 Composition API
-   完整的 TypeScript 支持
-   TailwindCSS 原子化样式
-   Vite 快速开发和构建
-   响应式设计，支持移动端

## 许可证

MIT License
