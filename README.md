# AI 旅行规划师

一个基于 Vue 3 和 Firebase 的 AI 旅行规划应用。

## 功能特性

- 智能行程规划：通过 AI 生成个性化旅行路线
- 费用预算与管理：记录旅行开销
- 用户管理与数据存储：注册登录系统，保存和管理多份旅行计划
- 云端行程同步：旅行计划、偏好设置、费用记录等数据云端同步

## 技术栈

- 前端框架：Vue 3 + Vite
- 路由管理：Vue Router
- 状态管理：无（使用Firebase直接操作数据）
- 数据库：Firebase Firestore
- 身份验证：Firebase Authentication
- UI/UX：响应式设计，地图为主的交互界面
- 语音识别：预留接口（可接入科大讯飞等 API）
- 地图服务：预留接口（可接入高德地图等 API）
- AI 服务：预留接口（可接入阿里百炼等大模型 API）

## 项目结构

```
src/
├── assets/              # 静态资源
├── components/          # 可复用组件
├── config/              # 配置文件
├── router/              # 路由配置
├── services/            # 服务封装
├── views/               # 页面组件
├── App.vue             # 根组件
├── main.js             # 入口文件
└── style.css           # 全局样式
```

## 环境配置

1. 复制 `.env.example` 文件为 `.env` 并填写实际配置：
   ```bash
   cp .env.example .env
   ```

2. 填写 Firebase 配置信息

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
  - companions: 同行人员
  - preferences: 旅行偏好
  - planDetails: 详细计划（JSON格式）
  - createdAt: 创建时间
  - updatedAt: 更新时间

### 用户偏好设置集合 (userPreferences)
- 文档ID：Firebase Auth 用户ID
- 字段：
  - userId: 用户ID
  - preferences: 偏好设置（JSON格式）
  - updatedAt: 更新时间

## 腾讯云CloudBase 支持

项目保留了对腾讯云CloudBase的支持，相关代码位于：
- [src/services/cloudbaseService.js](file://d:\code\AITravelPlanner\ai_travel_planner\src\services\cloudbaseService.js)：腾讯云CloudBase服务封装（当前被注释）
- [src/config/cloudbase.js](file://d:\code\AITravelPlanner\ai_travel_planner\src\config\cloudbase.js)：腾讯云CloudBase配置文件（可选创建）

如需切换到腾讯云CloudBase，只需：
1. 取消 [src/services/cloudbaseService.js](file://d:\code\AITravelPlanner\ai_travel_planner\src\services\cloudbaseService.js) 中的注释
2. 在视图组件中将 `firebaseService` 替换为 `cloudbaseService`
3. 配置腾讯云CloudBase环境变量

## 开发计划

- [x] 实现基础页面界面
- [x] 集成 Firebase Authentication 身份验证
- [x] 集成 Firebase Firestore 数据存储
- [ ] 集成语音识别功能（科大讯飞 API）
- [ ] 集成地图服务（高德地图 API）
- [ ] 集成 AI 服务（阿里百炼 API）
- [ ] 实现费用预算与管理功能
- [ ] 实现行程详情展示功能

## 注意事项

1. 本项目使用 Firebase 作为后端服务，需要自行创建 Firebase 项目并配置
2. 项目保留了对腾讯云CloudBase的支持，可根据需要切换
3. 语音识别、地图服务和AI服务需要接入相应的第三方API