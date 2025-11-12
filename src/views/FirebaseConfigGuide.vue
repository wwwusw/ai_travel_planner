<template>
  <div class="config-guide">
    <h1>Firebase配置指南</h1>
    
    <div class="guide-section">
      <h2>错误说明</h2>
      <p>您遇到的错误 "Firebase: Error (auth/configuration-not-found)" 通常是由于以下原因之一：</p>
      <ul>
        <li>Firebase项目配置不正确</li>
        <li>Firebase Authentication服务未启用</li>
        <li>API密钥配置错误</li>
        <li>环境变量未正确设置</li>
      </ul>
    </div>

    <div class="guide-section">
      <h2>解决方案</h2>
      
      <div class="step">
        <h3>步骤1：检查Firebase项目设置</h3>
        <ol>
          <li>访问 <a href="https://console.firebase.google.com/" target="_blank">Firebase控制台</a></li>
          <li>选择您的项目或创建一个新项目</li>
          <li>在项目概览页面，点击"Web"平台添加应用（如果尚未添加）</li>
          <li>注册应用并获取Firebase配置信息</li>
        </ol>
      </div>
      
      <div class="step">
        <h3>步骤2：启用Authentication服务</h3>
        <ol>
          <li>在Firebase控制台左侧菜单中，点击"Authentication"</li>
          <li>点击"开始"</li>
          <li>在"Sign-in method"标签页中，启用"Email/Password"登录方式</li>
        </ol>
      </div>
      
      <div class="step">
        <h3>步骤3：配置环境变量</h3>
        <ol>
          <li>在项目根目录创建 [.env](file://d:\code\AITravelPlanner\ai_travel_planner\.env) 文件（如果尚未创建）</li>
          <li>添加以下配置项（替换为您的实际值）：
            <pre>
VITE_FIREBASE_API_KEY=您的API密钥
VITE_FIREBASE_AUTH_DOMAIN=您的项目.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=您的项目ID
VITE_FIREBASE_STORAGE_BUCKET=您的项目.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=消息发送者ID
VITE_FIREBASE_APP_ID=应用ID
            </pre>
          </li>
        </ol>
      </div>
      
      <div class="step">
        <h3>步骤4：检查配置信息</h3>
        <p>确保您的Firebase配置信息与控制台中显示的信息完全一致：</p>
        <ul>
          <li>API密钥未过期</li>
          <li>项目ID正确</li>
          <li>认证域名正确</li>
        </ul>
      </div>
    </div>

    <div class="guide-section">
      <h2>常见问题</h2>
      <div class="faq-item">
        <h4>Q: 如何获取Firebase配置信息？</h4>
        <p>A: 在Firebase控制台中，进入项目设置页面，在"常规"标签页的"您的应用"部分可以找到Web应用的配置信息。</p>
      </div>
      
      <div class="faq-item">
        <h4>Q: 为什么启用Email/Password认证很重要？</h4>
        <p>A: 如果不启用认证方法，即使配置正确也无法进行注册和登录操作。</p>
      </div>
      
      <div class="faq-item">
        <h4>Q: 环境变量文件需要注意什么？</h4>
        <p>A: 环境变量文件中的键名必须以"VITE_"开头才能在客户端代码中访问。</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// 这是一个纯信息展示组件，无需逻辑
</script>

<style scoped>
.config-guide {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.guide-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.guide-section h2 {
  margin-top: 0;
  color: #333;
}

.step {
  margin-bottom: 20px;
}

.step h3 {
  color: #409eff;
}

.step ol {
  padding-left: 20px;
}

.step li {
  margin-bottom: 10px;
}

.faq-item {
  margin-bottom: 15px;
}

.faq-item h4 {
  margin-bottom: 5px;
  color: #555;
}

pre {
  background-color: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
}

a {
  color: #409eff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>