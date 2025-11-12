<template>
  <div class="travel-plan-detail">
    <header class="header">
      <h1>AI 旅行规划师</h1>
      <nav>
        <router-link to="/planner">规划旅行</router-link>
        <router-link to="/history">历史记录</router-link>
        <button @click="handleLogout" class="logout-btn">退出</button>
      </nav>
    </header>

    <div class="detail-container">
      <div v-if="loading" class="loading">
        <p>正在加载旅行计划详情...</p>
      </div>
      
      <div v-else-if="error" class="error-message">
        <p>{{ error }}</p>
        <button @click="goBack" class="back-btn">返回历史记录</button>
      </div>
      
      <div v-else-if="travelPlan" class="plan-detail">
        <div class="plan-header">
          <h2>{{ travelPlan.title }}</h2>
          <div class="plan-meta">
            <span>目的地: {{ travelPlan.destination }}</span>
            <span>天数: {{ travelPlan.duration }}天</span>
            <span>预算: ¥{{ travelPlan.budget }}</span>
            <span>创建时间: {{ formatDate(travelPlan.createdAt) }}</span>
          </div>
        </div>
        
        <!-- 地图展示 -->
        <div class="map-section">
          <h3>旅行地图</h3>
          <div class="map-container">
            <MapComponent 
              :destination="travelPlan.destination"
              :itinerary="itineraryData"
              @map-loaded="onMapLoaded"
              @destination-updated="onDestinationUpdated"
            />
          </div>
        </div>
        
        <div class="plan-content">
          <div class="raw-output" v-html="travelPlan.rawAiResponse"></div>
        </div>
        
        <div class="plan-actions">
          <button @click="goBack" class="back-btn">返回历史记录</button>
          <button @click="deletePlan" class="delete-btn">删除计划</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { authService, dataService } from '../services/firebaseService'
import MapComponent from '../components/MapComponent.vue'
import { parseItinerary, extractTravelRoute } from '../utils/itineraryParser'

const router = useRouter()
const route = useRoute()

// 旅行计划数据
const travelPlan = ref(null)
const loading = ref(true)
const error = ref('')
const itineraryData = ref([]) // 新增行程数据
let map = null

// 获取旅行计划详情
const loadTravelPlan = async (planId) => {
  loading.value = true
  error.value = ''
  
  const { success, plan, error: errorMsg } = await dataService.getTravelPlan(planId)
  
  if (success) {
    travelPlan.value = {
      id: plan.id,
      title: plan.title,
      destination: plan.destination,
      duration: plan.duration,
      budget: plan.budget,
      companionsType: plan.companionsType,
      companionsCount: plan.companionsCount,
      preferences: plan.preferences,
      rawAiResponse: plan.rawAiResponse,
      createdAt: plan.createdAt.toDate ? plan.createdAt.toDate() : new Date(plan.createdAt)
    }
    
    // 解析行程并在地图上显示
    const travelRoute = extractTravelRoute(plan.rawAiResponse)
    if (travelRoute.length > 0) {
      console.log('提取的旅行路线:', travelRoute)
      // 直接使用地点数组
      itineraryData.value = travelRoute
    } else {
      // 如果没有找到路线，则使用旧的解析方法
      const parsedItinerary = parseItinerary(plan.rawAiResponse)
      console.log('解析后的行程数据:', parsedItinerary)
      itineraryData.value = parsedItinerary
    }
  } else {
    error.value = '加载旅行计划失败: ' + (errorMsg || '未知错误')
  }
  
  loading.value = false
}

// 地图加载完成回调
const onMapLoaded = (mapInstance) => {
  console.log('地图加载完成')
  map = mapInstance
}

// 目的地更新回调
const onDestinationUpdated = (data) => {
  console.log('目的地更新完成:', data)
}

// 格式化日期
const formatDate = (date) => {
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
  return new Date(date).toLocaleDateString('zh-CN', options)
}

// 返回历史记录页面
const goBack = () => {
  router.push('/history')
}

// 删除计划
const deletePlan = async () => {
  if (confirm('确定要删除这个旅行计划吗？')) {
    const { success, error: errorMsg } = await dataService.deleteTravelPlan(travelPlan.value.id)
    
    if (success) {
      alert('删除成功')
      router.push('/history')
    } else {
      alert('删除失败: ' + (errorMsg || '未知错误'))
    }
  }
}

// 退出登录
const handleLogout = async () => {
  const { success, error: errorMsg } = await authService.logout()
  
  if (success) {
    // 退出成功，跳转到登录页面
    router.push('/login')
  } else {
    console.error('退出登录失败:', errorMsg)
  }
}

// 组件挂载时加载数据
onMounted(() => {
  const planId = route.params.id
  if (planId) {
    loadTravelPlan(planId)
  } else {
    error.value = '无效的旅行计划ID'
    loading.value = false
  }
})
</script>

<style scoped>
.travel-plan-detail {
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

.detail-container {
  padding: 20px 40px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .error-message {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.error-message {
  background-color: #fef0f0;
  color: #f56c6c;
  border-radius: 5px;
  margin: 20px 0;
}

.back-btn, .delete-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  margin: 0 10px;
}

.back-btn {
  background-color: #409eff;
  color: white;
}

.delete-btn {
  background-color: #f56c6c;
  color: white;
}

.back-btn:hover {
  background-color: #337ecc;
}

.delete-btn:hover {
  background-color: #e64a4a;
}

.plan-detail {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.plan-header h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.plan-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 15px 0;
  padding: 15px 0;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
}

.plan-meta span {
  color: #666;
}

.map-section {
  margin: 20px 0;
}

.map-section h3 {
  color: #333;
  margin-bottom: 15px;
}

.map-container {
  background: white;
  border-radius: 10px;
  height: 400px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

.plan-content {
  margin: 20px 0;
}

.raw-output {
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 5px;
  max-height: 600px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
}

.plan-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 15px;
  }
  
  .detail-container {
    padding: 20px;
  }
  
  .plan-meta {
    flex-direction: column;
    gap: 10px;
  }
}
</style>