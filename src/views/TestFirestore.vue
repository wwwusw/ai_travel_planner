<template>
  <div class="test-firestore">
    <h1>测试页面</h1>
    <div class="test-section">
      <h2>路线规划测试</h2>
      <div class="input-section">
        <textarea 
          v-model="testPlan" 
          rows="6" 
          placeholder="输入测试用的旅行计划"
          class="plan-input"
        ></textarea>
        <div class="button-group">
          <button @click="testRouteExtraction" class="test-btn">测试路线提取</button>
          <button @click="testRouteDisplay" class="test-btn">测试路线展示</button>
          <button @click="testSimpleRoute" class="test-btn">测试简单路线</button>
        </div>
      </div>
      
      <div class="result-section">
        <h3>提取结果:</h3>
        <div v-if="extractedRoute.length > 0" class="route-display">
          <ul>
            <li v-for="(place, index) in extractedRoute" :key="index">
              {{ index + 1 }}. {{ place }}
            </li>
          </ul>
        </div>
        <div v-else class="no-route">
          未提取到路线信息
        </div>
      </div>
    </div>
    
    <div class="map-section">
      <h2>地图展示</h2>
      <div class="map-container">
        <MapComponent 
          ref="mapComponent"
          :itinerary="routeItinerary"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MapComponent from '../components/MapComponent.vue'
import { extractTravelRoute } from '../utils/itineraryParser'

const testPlan = ref(`旅行路线：夫子庙->老门东->中山陵->明孝陵->南京博物院`)

const extractedRoute = ref([])
const routeItinerary = ref([])
const mapComponent = ref(null)

// 测试路线提取功能
const testRouteExtraction = () => {
  extractedRoute.value = extractTravelRoute(testPlan.value)
  console.log('提取的路线:', extractedRoute.value)
}

// 测试路线展示功能
const testRouteDisplay = () => {
  const route = extractTravelRoute(testPlan.value)
  extractedRoute.value = route
  
  if (route.length > 0) {
    routeItinerary.value = route;
  }
}

// 测试简单路线
const testSimpleRoute = () => {
  testPlan.value = `旅行路线：夫子庙->老门东->中山陵->明孝陵->南京博物院->颐和路->总统府->侵华日军南京大屠杀遇难同胞纪念馆->鸡鸣寺`
  testRouteDisplay()
}
</script>

<style scoped>
.test-firestore {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.test-section {
  margin-bottom: 30px;
}

.input-section {
  margin-bottom: 20px;
}

.plan-input {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.button-group {
  display: flex;
  gap: 10px;
}

.test-btn {
  background-color: #409eff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.test-btn:hover {
  background-color: #337ecc;
}

.result-section {
  padding: 15px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #f9f9f9;
}

.route-display ul {
  padding-left: 20px;
}

.route-display li {
  margin-bottom: 5px;
}

.no-route {
  color: #999;
  font-style: italic;
}

.map-section {
  margin-top: 30px;
}

.map-container {
  height: 500px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}
</style>