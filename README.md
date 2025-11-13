# AI Travel Planner

基于 Vue3 + Firebase + 讯飞星火大模型的智能旅游规划系统

## 项目介绍

本项目是一个智能旅游规划系统，结合了讯飞星火大模型的强大AI能力与Firebase的实时数据存储功能，为用户提供个性化的旅游路线规划服务。

## 功能特性

- 🤖 基于讯飞星火大模型的智能旅游路线生成
- 🔥 实时数据存储与同步（Firebase Firestore）
- 🗺️ 高德地图集成，可视化展示行程路线
- 👤 用户认证系统（注册/登录）
- 📱 响应式设计，支持移动端使用

## 技术栈

- Vue 3 (Composition API)
- Vite
- Firebase Authentication & Firestore
- 高德地图 JavaScript API
- 讯飞星火大模型 API

## 环境要求

- Node.js >= 16
- npm 或 yarn

## 安装与启动

1. 克隆项目
   ```
   git clone <项目地址>
   ```

2. 安装依赖
   ```
   npm install
   ```

3. 配置环境变量
   复制 [.env.example](.env.example) 文件并重命名为 `.env`，填写相应的配置信息

4. 启动开发服务器
   ```
   npm run dev
   ```

## Docker 部署

如果您希望通过 Docker 快速部署应用，请参考详细的 [Docker 部署指南](README.Docker.md)。

## 目录结构

```
src/
├── components/      # 公共组件
├── config/          # 配置文件
├── router/          # 路由配置
├── services/        # 业务逻辑层
├── utils/           # 工具函数
├── views/           # 页面视图
├── App.vue         # 根组件
├── main.js         # 入口文件
└── style.css       # 全局样式
```

## 配置说明

项目使用环境变量进行配置，需要在项目根目录创建 `.env` 文件，配置项如下：

```env
# 讯飞星火大模型配置
VITE_IFLYTEK_APP_ID=your_iflytek_app_id
VITE_IFLYTEK_API_KEY=your_iflytek_api_key
VITE_IFLYTEK_API_SECRET=your_iflytek_api_secret

# Firebase配置
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# 阿里百炼平台配置
VITE_ALIYUN_API_KEY=

# 高德地图API配置
VITE_AMAP_API_KEY=
VITE_AMAP_SECURITY_CODE=
```

## 开发指南

1. 获取API Keys
   - 讯飞星火大模型：[控制台地址](https://console.xfyun.cn/)
   - Firebase：[Firebase Console](https://console.firebase.google.com/)
   - 高德地图：[高德开放平台](https://lbs.amap.com/)

2. 配置Firebase
   参考 [Firebase配置指南](src/views/FirebaseConfigGuide.vue)

3. 配置讯飞星火大模型
   在 `.env` 文件中填入申请的API信息

## 注意事项

- 保护好各平台的API密钥，不要泄露给他人
- 项目中的API密钥应仅用于开发测试，请勿用于生产环境
- 如需生产部署，请参考 [Docker 部署指南](README.Docker.md)