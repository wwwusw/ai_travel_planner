# Docker 部署指南

## 拉取和运行镜像

### 镜像访问说明

本项目镜像托管在阿里云容器镜像服务上。本项目镜像仓库是公开的，所有人都能拉取：

#### 镜像是公开的（推荐）
任何人都可以直接拉取镜像，无需登录：
```bash
docker pull crpi-gshmldmgiuobxgey.cn-shanghai.personal.cr.aliyuncs.com/wwwusw-ai/ai-project:latest
```

### 运行容器

#### 方式一：使用 docker-compose（推荐）

1. 创建 `.env` 文件并配置所有必需的 API 密钥：
```env
# Firebase配置
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id

# 阿里百炼平台配置
VITE_ALIYUN_API_KEY=your_aliyun_api_key

# 高德地图API配置
VITE_AMAP_API_KEY=your_amap_api_key
VITE_AMAP_SECURITY_CODE=your_amap_security_code

# 讯飞星火大模型配置
VITE_IFLYTEK_APP_ID=your_iflytek_app_id
VITE_IFLYTEK_API_KEY=your_iflytek_api_key
VITE_IFLYTEK_API_SECRET=your_iflytek_api_secret
```

2. 启动服务：
```bash
docker-compose up -d
```

#### 方式二：使用 docker run 命令

```bash
docker run -d \
  -p 8080:80 \
  --name ai-travel-planner \
  -e VITE_FIREBASE_API_KEY=your_firebase_api_key \
  -e VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain \
  -e VITE_FIREBASE_PROJECT_ID=your_firebase_project_id \
  -e VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket \
  -e VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id \
  -e VITE_FIREBASE_APP_ID=your_firebase_app_id \
  -e VITE_ALIYUN_API_KEY=your_aliyun_api_key \
  -e VITE_AMAP_API_KEY=your_amap_api_key \
  -e VITE_AMAP_SECURITY_CODE=your_amap_security_code \
  -e VITE_IFLYTEK_APP_ID=your_iflytek_app_id \
  -e VITE_IFLYTEK_API_KEY=your_iflytek_api_key \
  -e VITE_IFLYTEK_API_SECRET=your_iflytek_api_secret \
  crpi-gshmldmgiuobxgey.cn-shanghai.personal.cr.aliyuncs.com/wwwusw-ai/ai-project:latest
```

访问地址: http://localhost:8080

## API 密钥获取说明

要运行此应用程序，您需要获取以下 API 密钥：

1. **Firebase**：
   - 访问 [Firebase Console](https://console.firebase.google.com/)
   - 创建新项目或选择现有项目
   - 在项目设置中找到 Web 应用配置

2. **阿里百炼平台**：
   - 访问 [阿里云百炼平台](https://help.aliyun.com/zh/bailian)
   - 创建API密钥

3. **高德地图**：
   - 访问 [高德开放平台](https://lbs.amap.com/)
   - 创建应用并获取API密钥

4. **讯飞星火大模型**：
   - 访问 [讯飞开放平台](https://www.xfyun.cn/)
   - 创建应用并获取相关密钥

## 故障排除

如果遇到问题，请检查：

1. 所有 API 密钥是否正确配置
2. 网络连接是否正常
3. 防火墙是否阻止了相关端口
4. 查看容器日志：
   ```bash
   docker logs ai-travel-planner
   ```