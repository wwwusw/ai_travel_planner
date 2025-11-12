# AI 旅行规划师

一个基于 Vue 3 和 Firebase 的 AI 旅行规划应用，帮助用户快速生成个性化的旅行计划。

![界面截图](public/screenshot.png) <!-- 如果有截图可以添加此行 -->

## 功能特性

- 🤖 智能行程规划：通过 AI 生成个性化旅行路线
- 💬 语音输入支持：支持语音方式描述旅行需求
- 🗺️ 地图可视化：在地图上直观展示旅行路线
- 💰 费用预算与管理：记录旅行开销和预算控制
- 👤 用户管理系统：注册登录系统，保存和管理多份旅行计划
- ☁️ 云端同步：旅行计划、偏好设置、费用记录等数据云端同步
- 📱 响应式设计：适配桌面端和移动端设备

## 技术栈

- 前端框架：[Vue 3](https://v3.cn.vuejs.org/) + [Vite](https://cn.vitejs.dev/)
- 路由管理：[Vue Router](https://router.vuejs.org/zh/)
- 状态管理：无（使用Firebase直接操作数据）
- 数据库：[Firebase Firestore](https://firebase.google.com/products/firestore)
- 身份验证：[Firebase Authentication](https://firebase.google.com/products/auth)
- UI/UX：响应式设计，地图为主的交互界面
- 语音识别：[科大讯飞语音识别 API](https://www.xfyun.cn/)
- 地图服务：[高德地图 API](https://lbs.amap.com/)
- AI 服务：[阿里百炼大模型 API](https://help.aliyun.com/zh/bailian)

## 项目结构

```
src/
├── assets/                 # 静态资源
├── components/             # 可复用组件
├── config/                 # 配置文件
├── router/                 # 路由配置
├── services/               # 服务封装
├── utils/                  # 工具函数
├── views/                  # 页面组件
├── App.vue                # 根组件
├── main.js                # 入口文件
└── style.css              # 全局样式
```

## 核心功能模块

### 1. 旅行规划 (TravelPlanner.vue)
- 支持手动输入和语音输入两种方式
- 调用阿里百炼大模型 API 生成个性化旅行计划
- 实时流式显示 AI 生成过程
- 在高德地图上可视化展示旅行路线
- 一键保存旅行计划到云端

### 2. 历史记录 (TravelHistory.vue)
- 展示用户保存的所有旅行计划
- 支持查看、删除历史计划
- 提供友好的用户界面浏览过往行程

### 3. 计划详情 (TravelPlanDetail.vue)
- 详细展示旅行计划内容
- 在地图上重新展示旅行路线
- 支持删除计划

## 环境配置

1. 复制 `.env.example` 文件为 `.env` 并填写实际配置：
   ```bash
   cp .env.example .env
   ```

2. 填写所需的服务配置信息：
   - Firebase 配置（必需）
   - 阿里百炼平台 API Key（用于 AI 服务）
   - 高德地图 API Key（用于地图服务）
   - 科大讯飞语音识别 API 配置（用于语音输入功能）

## 安装与运行

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```

4. 预览生产构建：
   ```bash
   npm run preview
   ```

## 数据库设计

本项目使用 Firestore 数据库，数据结构如下：

### 用户集合 (users)
- 文档ID：Firebase Auth 用户ID
- 字段：
  - email: 邮箱
  - createdAt: 创建时间

### 旅行计划集合 (travelPlans)
- 文档ID：自动生成
- 字段：
  - userId: 用户ID
  - title: 计划标题
  - destination: 目的地
  - duration: 旅行天数
  - budget: 预算
  - companionsType: 同行人员类型
  - companionsCount: 同行人员数量
  - preferences: 旅行偏好
  - rawAiResponse: AI 生成的原始响应内容
  - createdAt: 创建时间
  - updatedAt: 更新时间

## API 接口说明

### AI 旅行计划生成

项目通过阿里百炼平台的大模型 API 生成旅行计划：

```
POST /api/dashscope/api/v1/services/aigc/text-generation/generation

Headers:
- Authorization: Bearer {VITE_ALIYUN_API_KEY}
- Content-Type: application/json
- X-DashScope-SSE: enable

Body:
{
  "model": "qwen3-max",
  "input": {
    "prompt": "根据用户输入生成旅行计划的提示词"
  },
  "parameters": {
    "max_tokens": 2000,
    "temperature": 0.7,
    "top_p": 0.8,
    "incremental_output": true
  }
}
```

## 注意事项

1. 本项目使用 Firebase 作为后端服务，需要自行创建 Firebase 项目并配置
2. 语音识别、地图服务和AI服务需要接入相应的第三方API
3. 项目使用 Vite 代理解决跨域问题，请确保配置正确
