# 使用 Node.js 官方镜像作为基础镜像
FROM node:18-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制项目文件
COPY . .

# 构建项目
RUN npm run build

# 使用 nginx 作为生产服务器
FROM nginx:alpine

# 复制构建结果到 nginx html 目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]