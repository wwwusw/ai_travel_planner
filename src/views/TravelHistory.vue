<template>
  <div class="travel-history">
    <header class="header">
      <h1>AI 旅行规划师</h1>
      <nav>
        <router-link to="/planner">规划旅行</router-link>
        <router-link to="/history">历史记录</router-link>
        <button @click="handleLogout" class="logout-btn">退出</button>
      </nav>
    </header>

    <div class="history-container">
      <h2>历史旅行计划</h2>
      
      <div v-if="loading" class="loading">
        <p>正在加载历史记录...</p>
      </div>
      
      <div v-else-if="errorMessage" class="error-message">
        <p>{{ errorMessage }}</p>
        <div v-if="indexError" class="index-error-help">
          <h3>解决方案:</h3>
          <ol>
            <li>打开 Firebase 控制台: <a href="https://console.firebase.google.com/" target="_blank">https://console.firebase.google.com/</a></li>
            <li>进入 "Firestore Database" 部分</li>
            <li>点击 "索引" 选项卡</li>
            <li>点击 "添加索引"</li>
            <li>设置以下参数:
              <ul>
                <li>集合 ID: travelPlans</li>
                <li>查询范围: 集合</li>
                <li>字段:
                  <ul>
                    <li>userId (升序)</li>
                    <li>createdAt (降序)</li>
                  </ul>
                </li>
                <li>状态: 启用</li>
              </ul>
            </li>
            <li>点击 "保存" 并等待索引构建完成 (通常需要几分钟)</li>
          </ol>
        </div>
      </div>
      
      <div v-else-if="travelHistories.length === 0" class="no-history">
        <p>您还没有保存任何旅行计划</p>
        <router-link to="/planner" class="plan-link">开始规划旅行</router-link>
      </div>
      
      <div v-else class="history-list">
        <div 
          v-for="history in travelHistories" 
          :key="history.id" 
          class="history-item"
          @click="viewHistoryDetail(history)"
        >
          <div class="history-header">
            <h3>{{ history.title }}</h3>
            <span class="date">{{ formatDate(history.createdAt) }}</span>
          </div>
          <div class="history-summary">
            <p>{{ history.destination }} · {{ history.duration }}天 · 预算¥{{ history.budget }}</p>
            <p class="preferences">{{ history.preferences }}</p>
          </div>
          <div class="history-footer">
            <button @click.stop="deleteHistory(history.id)" class="delete-btn">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService, dataService } from '../services/firebaseService'
// 保留腾讯云CloudBase相关导入以备将来使用
// import { cloudbaseAuthService, cloudbaseDataService } from '../services/cloudbaseService'

const router = useRouter()

// 历史记录数据
const travelHistories = ref([])
const loading = ref(true)
const userId = ref(null)
const errorMessage = ref('')
const indexError = ref(false)

// 监听认证状态
onMounted(() => {
  authService.onAuthStateChanged(async (user) => {
    if (user) {
      userId.value = user.uid
      await loadTravelHistories()
    } else {
      // 用户未登录，重定向到登录页面
      router.push('/login')
    }
  })
})

// 加载旅行历史记录
const loadTravelHistories = async () => {
  loading.value = true
  errorMessage.value = ''
  indexError.value = false
  
  const { success, plans, error } = await dataService.getUserTravelPlans(userId.value)
  
  if (success) {
    // 处理从Firebase获取的数据
    travelHistories.value = plans.map(plan => ({
      id: plan.id,
      title: plan.title,
      destination: plan.destination,
      duration: plan.duration,
      budget: plan.budget,
      preferences: plan.preferences,
      createdAt: plan.createdAt.toDate ? plan.createdAt.toDate() : new Date(plan.createdAt)
    }))
  } else {
    errorMessage.value = '获取旅行历史记录失败: ' + error
    // 检查是否是索引错误
    if (error.includes('索引')) {
      indexError.value = true
    }
    console.error('获取旅行历史记录失败:', error)
  }
  
  loading.value = false
}

// 格式化日期
const formatDate = (date) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' }
  return new Date(date).toLocaleDateString('zh-CN', options)
}

// 查看历史详情
const viewHistoryDetail = (history) => {
  router.push(`/plan/${history.id}`)
}

// 删除历史记录
const deleteHistory = async (id) => {
  if (confirm('确定要删除这个旅行计划吗？')) {
    const { success, error } = await dataService.deleteTravelPlan(id)
    
    if (success) {
      // 从列表中移除已删除的项目
      travelHistories.value = travelHistories.value.filter(item => item.id !== id)
      alert('删除成功')
    } else {
      alert('删除失败: ' + (error || '未知错误'))
    }
  }
}

// 退出登录
const handleLogout = async () => {
  const { success, error } = await authService.logout()
  
  if (success) {
    // 退出成功，跳转到登录页面
    router.push('/login')
  } else {
    console.error('退出登录失败:', error)
  }
}
</script>

<style scoped>
.travel-history {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: white;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.header h1 {
  margin: 0;
  color: #333;
}

.header nav {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header nav a {
  text-decoration: none;
  color: #333;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s;
}

.header nav a:hover,
.header nav a.router-link-active {
  background-color: #409eff;
  color: white;
}

.logout-btn {
  padding: 8px 16px;
  background-color: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.history-container {
  padding: 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.history-container h2 {
  color: #333;
  margin-bottom: 20px;
}

.loading, .no-history {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.error-message {
  padding: 20px;
  background-color: #fef0f0;
  color: #f56c6c;
  border-radius: 5px;
  margin-bottom: 20px;
}

.index-error-help {
  margin-top: 15px;
  padding: 15px;
  background-color: #f0f9ff;
  border-radius: 5px;
  color: #333;
}

.index-error-help h3 {
  margin-top: 0;
  color: #409eff;
}

.index-error-help ol, .index-error-help ul {
  text-align: left;
  padding-left: 20px;
}

.index-error-help li {
  margin-bottom: 10px;
}

.index-error-help a {
  color: #409eff;
  word-break: break-all;
}

.plan-link {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #409eff;
  color: white;
  text-decoration: none;
  border-radius: 5px;
  transition: background-color 0.3s;
}

.plan-link:hover {
  background-color: #337ecc;
}

.history-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.history-item {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.history-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0,0,0,0.15);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.history-header h3 {
  margin: 0;
  color: #333;
}

.date {
  color: #999;
  font-size: 14px;
}

.history-summary p {
  margin: 8px 0;
  color: #666;
}

.preferences {
  color: #888;
  font-style: italic;
}

.history-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
}

.delete-btn, .export-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
}

.export-btn {
  background-color: #409eff;
  color: white;
}

.delete-btn:hover {
  background-color: #e64a4a;
}

.export-btn:hover {
  background-color: #337ecc;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }
  
  .history-container {
    padding: 20px;
  }
  
  .history-list {
    grid-template-columns: 1fr;
  }
}
</style>
```