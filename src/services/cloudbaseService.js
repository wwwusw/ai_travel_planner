// 腾讯云CloudBase服务封装（保留以备将来使用）
// 这个文件包含与腾讯云CloudBase相关的代码，目前未激活使用

/*
import cloudbase from '@cloudbase/js-sdk'

// 初始化CloudBase
const app = cloudbase.init({
  env: import.meta.env.VITE_CLOUDBASE_ENV_ID,
  region: import.meta.env.VITE_CLOUDBASE_REGION
})

const auth = app.auth({
  persistence: 'local'
})

const db = app.database()

// 用户认证相关API（腾讯云CloudBase版本）
export const cloudbaseAuthService = {
  // 用户注册
  async register(email, password) {
    try {
      const result = await auth.signUpWithEmailAndPassword(email, password)
      return { success: true, user: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 用户登录
  async login(email, password) {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password)
      return { success: true, user: result }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 用户登出
  async logout() {
    try {
      await auth.signOut()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 获取当前用户
  getCurrentUser() {
    return auth.currentUser
  },

  // 监听认证状态变化
  onAuthStateChanged(callback) {
    return auth.onLoginStateChange(callback)
  }
}

// 数据存储相关API（腾讯云CloudBase版本）
export const cloudbaseDataService = {
  // 创建旅行计划
  async createTravelPlan(userId, planData) {
    try {
      const collection = db.collection('travelPlans')
      const plan = {
        userId,
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      const result = await collection.add(plan)
      return { success: true, planId: result.id }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 获取用户的所有旅行计划
  async getUserTravelPlans(userId) {
    try {
      const collection = db.collection('travelPlans')
      const result = await collection
        .where({ userId })
        .orderBy({ createdAt: 'desc' })
        .get()
      return { success: true, plans: result.data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 获取单个旅行计划
  async getTravelPlan(planId) {
    try {
      const collection = db.collection('travelPlans')
      const result = await collection.doc(planId).get()
      if (result.data) {
        return { success: true, plan: result.data }
      } else {
        return { success: false, error: '旅行计划不存在' }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 更新旅行计划
  async updateTravelPlan(planId, planData) {
    try {
      const collection = db.collection('travelPlans')
      await collection.doc(planId).update({
        ...planData,
        updatedAt: new Date()
      })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 删除旅行计划
  async deleteTravelPlan(planId) {
    try {
      const collection = db.collection('travelPlans')
      await collection.doc(planId).remove()
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}
*/

// 导出空对象以保持模块结构
export const cloudbaseAuthService = {}
export const cloudbaseDataService = {}