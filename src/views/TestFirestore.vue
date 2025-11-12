<template>
  <div class="test-container">
    <h1>Firebase Firestore 测试</h1>
    
    <div class="test-section">
      <h2>配置检查</h2>
      <div v-if="!isConfigured">
        <p>检测到Firebase配置可能存在问题</p>
        <router-link to="/firebase-config">查看配置指南</router-link>
      </div>
      <div v-else>
        <p>Firebase配置正常</p>
      </div>
    </div>
    
    <div class="test-section">
      <h2>用户认证测试</h2>
      <div v-if="!user">
        <p>当前未登录</p>
        <button @click="testLogin">测试登录</button>
        <button @click="testRegister">测试注册</button>
      </div>
      <div v-else>
        <p>当前用户: {{ user.email }}</p>
        <button @click="testLogout">测试登出</button>
      </div>
    </div>

    <div class="test-section">
      <h2>Firestore 数据测试</h2>
      <div>
        <button @click="testCreate" :disabled="!user || !isConfigured">创建文档</button>
        <button @click="testRead" :disabled="!user || !isConfigured">读取文档</button>
        <button @click="testUpdate" :disabled="!user || !isConfigured">更新文档</button>
        <button @click="testDelete" :disabled="!user || !isConfigured">删除文档</button>
      </div>
      
      <div class="result-section">
        <h3>测试结果:</h3>
        <pre>{{ testResult }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { authService, dataService } from '../services/firebaseService'

const user = ref(null)
const testResult = ref('')
const isConfigured = ref(true)

// 检查Firebase配置
onMounted(() => {
  try {
    // 检查必要的环境变量是否存在
    const requiredEnvVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID'
    ]
    
    for (const envVar of requiredEnvVars) {
      if (!import.meta.env[envVar]) {
        isConfigured.value = false
        testResult.value += `缺少环境变量: ${envVar}\n`
      }
    }
    
    if (isConfigured.value) {
      testResult.value += 'Firebase配置检查通过\n'
    }
  } catch (error) {
    isConfigured.value = false
    testResult.value += `配置检查失败: ${error.message}\n`
  }
  
  // 监听认证状态
  try {
    authService.onAuthStateChanged(u => {
      user.value = u
      if (u) {
        testResult.value += `用户已登录: ${u.email}\n`
      } else {
        testResult.value += '用户未登录\n'
      }
    })
  } catch (error) {
    testResult.value += `认证监听失败: ${error.message}\n`
  }
})

// 测试登录
const testLogin = async () => {
  try {
    const email = prompt('请输入邮箱:')
    const password = prompt('请输入密码:')
    
    if (!email || !password) {
      testResult.value += '邮箱或密码不能为空\n'
      return
    }
    
    testResult.value += '正在登录...\n'
    const result = await authService.login(email, password)
    
    if (result.success) {
      testResult.value += `登录成功: ${result.user.email}\n`
    } else {
      testResult.value += `登录失败: ${result.error}\n`
    }
  } catch (error) {
    testResult.value += `登录异常: ${error.message}\n`
  }
}

// 测试注册
const testRegister = async () => {
  try {
    const email = prompt('请输入邮箱:')
    const password = prompt('请输入密码:')
    
    if (!email || !password) {
      testResult.value += '邮箱或密码不能为空\n'
      return
    }
    
    testResult.value += '正在注册...\n'
    const result = await authService.register(email, password)
    
    if (result.success) {
      testResult.value += `注册成功: ${result.user.email}\n`
    } else {
      testResult.value += `注册失败: ${result.error}\n`
    }
  } catch (error) {
    testResult.value += `注册异常: ${error.message}\n`
  }
}

// 测试登出
const testLogout = async () => {
  try {
    testResult.value += '正在登出...\n'
    const result = await authService.logout()
    
    if (result.success) {
      testResult.value += '登出成功\n'
    } else {
      testResult.value += `登出失败: ${result.error}\n`
    }
  } catch (error) {
    testResult.value += `登出异常: ${error.message}\n`
  }
}

// 测试创建文档
const testCreate = async () => {
  try {
    testResult.value += '正在创建文档...\n'
    const testData = {
      title: '测试文档',
      content: '这是一个测试文档',
      createdAt: new Date()
    }
    
    const result = await dataService.createTravelPlan(user.value.uid, testData)
    
    if (result.success) {
      testResult.value += `文档创建成功: ${result.plan.id}\n`
    } else {
      testResult.value += `文档创建失败: ${result.error}\n`
    }
  } catch (error) {
    testResult.value += `创建文档异常: ${error.message}\n`
  }
}

// 测试读取文档
const testRead = async () => {
  try {
    testResult.value += '正在读取文档...\n'
    const result = await dataService.getUserTravelPlans(user.value.uid)
    
    if (result.success) {
      testResult.value += `文档读取成功，共找到 ${result.plans.length} 个文档\n`
      if (result.plans.length > 0) {
        testResult.value += `第一个文档ID: ${result.plans[0].id}\n`
      }
    } else {
      testResult.value += `文档读取失败: ${result.error}\n`
    }
  } catch (error) {
    testResult.value += `读取文档异常: ${error.message}\n`
  }
}

// 测试更新文档
const testUpdate = async () => {
  try {
    testResult.value += '正在更新文档...\n'
    
    // 先获取一个文档ID
    const readResult = await dataService.getUserTravelPlans(user.value.uid)
    
    if (readResult.success && readResult.plans.length > 0) {
      const planId = readResult.plans[0].id
      const updateData = {
        title: '更新后的测试文档',
        updatedAt: new Date()
      }
      
      const result = await dataService.updateTravelPlan(planId, updateData)
      
      if (result.success) {
        testResult.value += `文档更新成功: ${planId}\n`
      } else {
        testResult.value += `文档更新失败: ${result.error}\n`
      }
    } else {
      testResult.value += '没有可更新的文档\n'
    }
  } catch (error) {
    testResult.value += `更新文档异常: ${error.message}\n`
  }
}

// 测试删除文档
const testDelete = async () => {
  try {
    testResult.value += '正在删除文档...\n'
    
    // 先获取一个文档ID
    const readResult = await dataService.getUserTravelPlans(user.value.uid)
    
    if (readResult.success && readResult.plans.length > 0) {
      const planId = readResult.plans[0].id
      
      const result = await dataService.deleteTravelPlan(planId)
      
      if (result.success) {
        testResult.value += `文档删除成功: ${planId}\n`
      } else {
        testResult.value += `文档删除失败: ${result.error}\n`
      }
    } else {
      testResult.value += '没有可删除的文档\n'
    }
  } catch (error) {
    testResult.value += `删除文档异常: ${error.message}\n`
  }
}
</script>

<style scoped>
.test-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.test-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

.test-section h2 {
  margin-top: 0;
}

button {
  padding: 8px 16px;
  margin: 5px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.result-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.result-section pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  margin: 0;
}

a {
  color: #409eff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>