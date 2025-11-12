<template>
  <div class="travel-planner">
    <header class="header">
      <h1>AI 旅行规划师</h1>
      <nav>
        <router-link to="/planner">规划旅行</router-link>
        <router-link to="/history">历史记录</router-link>
        <button @click="handleLogout" class="logout-btn">退出</button>
      </nav>
    </header>

    <div class="planner-container">
      <!-- 用户输入模块 -->
      <div class="input-section">
        <h2>旅行需求</h2>
        <!-- 输入模式切换标签 -->
        <div class="input-mode-tabs">
          <button 
            :class="['tab', { active: inputMode === 'manual' }]" 
            @click="switchInputMode('manual')"
          >
            手动输入
          </button>
          <button 
            :class="['tab', { active: inputMode === 'voice' }]" 
            @click="switchInputMode('voice')"
          >
            语音输入
          </button>
        </div>

        <form @submit.prevent="handleGenerateTravelPlan">
          <!-- 手动输入模式 -->
          <div v-if="inputMode === 'manual'">
            <div class="form-group">
              <label for="destination">目的地</label>
              <input 
                type="text" 
                id="destination" 
                v-model="travelRequest.destination" 
                placeholder="例如：日本"
                required
              >
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="duration">旅行天数</label>
                <input 
                  type="number" 
                  id="duration" 
                  v-model.number="travelRequest.duration" 
                  min="1"
                  required
                >
              </div>

              <div class="form-group">
                <label for="budget">预算(元)</label>
                <input 
                  type="number" 
                  id="budget" 
                  v-model.number="travelRequest.budget" 
                  min="0"
                  required
                >
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="companions">同行人员</label>
                <select id="companions" v-model="travelRequest.companionsType">
                  <option value="alone">独自旅行</option>
                  <option value="couple">情侣/夫妻</option>
                  <option value="family">家庭</option>
                  <option value="friends">朋友</option>
                  <option value="group">团体</option>
                </select>
              </div>

              <div class="form-group" v-if="travelRequest.companionsType === 'group'">
                <label for="companionsCount">人数</label>
                <input 
                  type="number" 
                  id="companionsCount" 
                  v-model.number="travelRequest.companionsCount" 
                  min="3"
                  max="50"
                  required
                >
              </div>
            </div>

            <div class="form-group">
              <label for="preferences">旅行偏好</label>
              <textarea 
                id="preferences" 
                v-model="travelRequest.preferences" 
                placeholder="例如：喜欢美食和动漫，带孩子"
                rows="3"
              ></textarea>
            </div>
          </div>

          <!-- 语音输入模式 -->
          <div v-else-if="inputMode === 'voice'">
            <div class="form-group">
              <label for="voicePreferences">语音输入</label>
              <textarea 
                id="voicePreferences" 
                v-model="travelRequest.preferences" 
                placeholder="点击下方语音按钮开始语音输入，或直接在此输入文本"
                rows="5"
              ></textarea>
            </div>
            
            <div class="voice-input">
              <button type="button" @click="toggleVoiceInput" class="voice-btn" :disabled="isInitializing">
                <span v-if="!isListening">🎤 开始语音输入</span>
                <span v-else>🔊 正在聆听... 点击结束</span>
              </button>
            </div>
          </div>

          <button type="submit" class="generate-btn" :disabled="isLoading">
            {{ isLoading ? '生成中...' : '生成旅行计划' }}
          </button>
        </form>
      </div>

      <!-- AI输出结果模块 -->
      <div class="output-section">
        <h2>旅行计划</h2>
        <div v-if="isLoading" class="loading">
          <p>AI正在为您生成旅行计划...</p>
          <div class="stream-output" v-html="streamOutput"></div>
        </div>
        
        <div v-else-if="streamOutput" class="plan-result">
          <div class="raw-output" v-html="streamOutput"></div>
          
          <div class="actions">
            <button @click="saveTravelPlan" class="save-btn">保存计划</button>
          </div>
        </div>
        
        <div v-else class="no-plan">
          <p>请输入您的旅行需求，AI将为您生成个性化旅行计划</p>
        </div>
        
        <div v-if="saveError" class="error-message">
          {{ saveError }}
        </div>
        
        <div v-if="saveSuccess" class="success-message">
          计划保存成功！
        </div>
      </div>
    </div>

    <!-- 地图规划模块 -->
    <div class="map-section">
      <h2>旅行地图</h2>
      <div class="map-test-controls">
        <input 
          type="text" 
          v-model="testDestination" 
          placeholder="输入测试目的地，例如：上海" 
          class="destination-input"
        />
        <button @click="testUpdateMap" class="test-btn">测试更新地图</button>
      </div>
      <div class="map-container">
        <MapComponent 
          ref="mapComponent"
          :destination="mapDestination"
          :itinerary="itineraryData"
          @map-loaded="onMapLoaded"
          @destination-updated="onDestinationUpdated"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { authService, dataService } from '../services/firebaseService'
import { createTravelPlan } from '../services/travelPlanService'
import MapComponent from '../components/MapComponent.vue'
import { parseItinerary } from '../utils/itineraryParser'
import { initSpeechRecognition, endSpeechRecognition } from '../services/iflytekService'

const router = useRouter()

// 输入模式: manual-手动输入, voice-语音输入
const inputMode = ref('manual')

// 语音识别相关
const isListening = ref(false)
const isInitializing = ref(false)

// 旅行请求数据
const travelRequest = reactive({
  destination: '南京',
  duration: 5,
  budget: 10000,
  companionsType: 'family',
  companionsCount: 3,
  preferences: ''
})

// 地图相关引用
const mapComponent = ref(null)
const mapDestination = ref('')
const itineraryData = ref([])

// 测试目的地输入
const testDestination = ref('')

// 旅行计划结果
const isLoading = ref(false)
const saveError = ref('')
const saveSuccess = ref(false)
const streamOutput = ref('')

// 获取当前用户ID
const userId = ref(null)

// 切换输入模式
const switchInputMode = (mode) => {
  inputMode.value = mode
  // 清空语音识别结果
  if (mode === 'manual') {
    travelRequest.preferences = ''
  }
}

// 监听认证状态
onMounted(() => {
  authService.onAuthStateChanged(user => {
    if (user) {
      userId.value = user.uid
    } else {
      // 用户未登录，重定向到登录页面
      router.push('/login')
    }
  })
})

// 测试更新地图的函数
const testUpdateMap = () => {
  if (testDestination.value) {
    mapDestination.value = testDestination.value
  } else {
    alert('请输入目的地')
  }
}

// 地图加载完成回调
const onMapLoaded = (mapInstance) => {
  console.log('地图加载完成')
}

// 目的地更新回调
const onDestinationUpdated = (data) => {
  console.log('目的地更新完成:', data)
}

// 生成旅行计划
const handleGenerateTravelPlan = async () => {
  if (!travelRequest.destination) {
    alert('请输入旅行目的地')
    return
  }
  
  isLoading.value = true
  saveSuccess.value = false
  saveError.value = ''
  streamOutput.value = ''
  itineraryData.value = [] // 清空之前的行程数据
  
  try {
    // 构建请求参数
    let requestParams;
    
    if (inputMode.value === 'manual') {
      // 手动输入模式 - 发送完整的参数
      requestParams = {
        destination: travelRequest.destination,
        duration: travelRequest.duration,
        budget: travelRequest.budget,
        companionsType: travelRequest.companionsType,
        companionsCount: travelRequest.companionsCount,
        preferences: travelRequest.preferences,
        isVoiceInput: false
      }
    } else {
      // 语音输入模式 - 只发送识别后的文本
      requestParams = {
        preferences: travelRequest.preferences, // 语音识别的完整文本
        isVoiceInput: true
      }
    }
    
    // 调用旅行计划服务，从环境变量获取API Key
    const stream = await createTravelPlan(requestParams, import.meta.env.VITE_ALIYUN_API_KEY)
    
    // 处理流式输出
    const reader = stream.getReader()
    const decoder = new TextDecoder('utf-8')
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value, { stream: true })
      // 解析流式数据并更新到页面
      parseStreamData(chunk)
    }
    
    // 更新地图显示目的地
    mapDestination.value = travelRequest.destination
    
    // 解析行程并在地图上显示
    const parsedItinerary = parseItinerary(streamOutput.value)
    console.log('解析后的行程数据:', parsedItinerary)
    itineraryData.value = parsedItinerary
    
    isLoading.value = false
  } catch (error) {
    console.error('生成旅行计划失败:', error)
    streamOutput.value = `<p class="error">生成旅行计划失败: ${error.message}</p>`
    isLoading.value = false
  }
}

// 解析流式数据 - 针对你的自定义格式
const parseStreamData = (chunk) => {
  try {
    // 按行分割数据块
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      
      // 处理 data: 开头的行
      if (trimmedLine.startsWith('data:')) {
        const dataStr = trimmedLine.substring(5).trim();
        
        try {
          const data = JSON.parse(dataStr);
          
          // 提取内容 - 根据你的格式：data.output.choices[0].message.content
          if (data.output && 
              data.output.choices && 
              data.output.choices.length > 0 && 
              data.output.choices[0].message && 
              data.output.choices[0].message.content !== undefined) {
            
            const content = data.output.choices[0].message.content;
            
            // 确保内容是字符串
            const contentStr = String(content);
            
            if (contentStr) {
              // 直接添加内容到输出（保持换行）
              streamOutput.value += contentStr.replace(/\n/g, '<br>');
              
              // 强制更新DOM并滚动到底部
              nextTick(() => {
                const outputElement = document.querySelector('.stream-output');
                if (outputElement) {
                  outputElement.scrollTop = outputElement.scrollHeight;
                }
              });
            }
          }
          
        } catch (jsonError) {
          console.warn('JSON解析失败:', jsonError, '原始数据:', dataStr);
          // 如果JSON解析失败，尝试直接显示原始数据
          if (dataStr && !dataStr.startsWith('{')) {
            streamOutput.value += dataStr.replace(/\n/g, '<br>');
            nextTick(scrollToBottom);
          }
        }
      }
    }
  } catch (error) {
    console.error('解析流数据失败:', error);
    // 出错时显示错误信息
    streamOutput.value += `<p class="error">解析数据时出错: ${error.message}</p>`;
    nextTick(scrollToBottom);
  }
}

// 滚动到底部的辅助函数
const scrollToBottom = () => {
  const outputElement = document.querySelector('.stream-output');
  if (outputElement) {
    outputElement.scrollTop = outputElement.scrollHeight;
  }
}

// 保存旅行计划
const saveTravelPlan = async () => {
  if (!userId.value) {
    saveError.value = '用户未登录'
    return
  }
  
  if (!streamOutput.value) {
    saveError.value = '没有可保存的旅行计划'
    return
  }
  
  saveError.value = ''
  saveSuccess.value = false
  
  // 构建要保存的计划数据
  const planData = {
    title: `${travelRequest.destination} ${travelRequest.duration}日游`,
    destination: travelRequest.destination,
    duration: travelRequest.duration,
    budget: travelRequest.budget,
    companionsType: travelRequest.companionsType,
    companionsCount: travelRequest.companionsCount,
    preferences: travelRequest.preferences,
    rawAiResponse: streamOutput.value, // 保存原始AI输出
    createdAt: new Date()
  }
  
  const { success, error } = await dataService.createTravelPlan(userId.value, planData)
  
  if (success) {
    saveSuccess.value = true
    // 3秒后清除成功消息
    setTimeout(() => {
      saveSuccess.value = false
    }, 3000)
  } else {
    saveError.value = error || '保存失败'
  }
}

// 语音输入功能 - 切换录音状态
const toggleVoiceInput = async () => {
  if (isListening.value) {
    // 结束录音
    endSpeechRecognition()
    isListening.value = false
  } else {
    // 开始录音
    isInitializing.value = true
    
    try {
      // 保存当前已有的文本内容（用户手动输入的部分）
      const existingText = travelRequest.preferences;
      
      // 初始化语音识别
      await initSpeechRecognition((text, isFinal) => {
        // 只有当文本不为空且不是单纯的句号时才更新
        if (text && text.trim() !== '' && text.trim() !== '。') {
          // 使用最新的识别结果，而不是追加
          // 在已有的文本和新识别的文本之间添加适当的分隔
          const separator = existingText && !existingText.endsWith(' ') && !text.startsWith(' ') ? ' ' : '';
          travelRequest.preferences = existingText + separator + text;
        }
        
        if (isFinal) {
          // 识别结束
          isListening.value = false
          isInitializing.value = false
        }
      })
      
      // 设置为正在聆听状态
      isListening.value = true
      isInitializing.value = false
      
    } catch (error) {
      console.error('语音识别初始化失败:', error)
      alert('语音识别功能初始化失败: ' + error.message)
      isListening.value = false
      isInitializing.value = false
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
.travel-planner {
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

.planner-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 20px 40px;
}

.input-section, .output-section {
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.input-section h2, .output-section h2 {
  margin-top: 0;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #555;
}

.form-group input, .form-group select, .form-group textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus, 
.form-group select:focus, 
.form-group textarea:focus {
  outline: none;
  border-color: #409eff;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.voice-input {
  text-align: center;
  margin: 20px 0;
}

.voice-btn {
  padding: 12px 24px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.voice-btn:hover:not(:disabled) {
  background-color: #5daf34;
}

.voice-btn:disabled {
  background-color: #b3e19d;
  cursor: not-allowed;
}

.generate-btn {
  width: 100%;
  padding: 12px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.generate-btn:hover:not(:disabled) {
  background-color: #337ecc;
}

.generate-btn:disabled {
  background-color: #a0cfff;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 20px 0;
}

.stream-output {
  text-align: left;
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 5px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.raw-output {
  padding: 15px;
  background-color: #f8f8f8;
  border-radius: 5px;
  max-height: 500px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
  text-align: left;
}

.actions {
  text-align: center;
  margin-top: 20px;
}

.save-btn {
  padding: 12px 24px;
  background-color: #e6a23c;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.save-btn:hover {
  background-color: #d6922c;
}

.no-plan {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.map-section {
  padding: 0 40px 40px;
}

.map-section h2 {
  color: #333;
  margin-bottom: 15px;
}

.map-test-controls {
  margin-bottom: 15px;
  display: flex;
  gap: 10px;
}

.destination-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
}

.test-btn {
  padding: 8px 16px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}

.test-btn:hover {
  background-color: #5daf34;
}

.map-container {
  background: white;
  border-radius: 10px;
  height: 400px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  overflow: hidden;
}

@media (max-width: 768px) {
  .planner-container {
    grid-template-columns: 1fr;
  }
  
  .header {
    flex-direction: column;
    gap: 15px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

/* 添加输入模式切换样式 */
.input-mode-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tab {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-bottom: 3px solid transparent;
}

.tab.active {
  color: #409eff;
  border-bottom-color: #409eff;
  font-weight: bold;
}

.voice-input {
  text-align: center;
  margin: 20px 0;
}

.voice-btn {
  padding: 12px 24px;
  background-color: #67c23a;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.voice-btn:hover:not(:disabled) {
  background-color: #5daf34;
}

.voice-btn:disabled {
  background-color: #b3e19d;
  cursor: not-allowed;
}
</style>