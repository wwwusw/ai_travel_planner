// Firebase服务封装
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth'
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  limit,
  addDoc
} from 'firebase/firestore'
import { auth, db } from '../config/firebase'

// 用户认证相关API
export const authService = {
  // 用户注册
  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 用户登录
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return { success: true, user: userCredential.user }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 用户登出
  async logout() {
    try {
      await signOut(auth)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 监听认证状态变化
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback)
  }
}

// 数据存储相关API
export const dataService = {
  // 创建旅行计划
  async createTravelPlan(userId, planData) {
    try {
      const planRef = doc(collection(db, 'travelPlans'))
      const plan = {
        id: planRef.id,
        userId,
        ...planData,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      await setDoc(planRef, plan)
      return { success: true, plan }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 获取用户的所有旅行计划
  async getUserTravelPlans(userId) {
    try {
      const q = query(
        collection(db, 'travelPlans'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const plans = []
      querySnapshot.forEach((doc) => {
        plans.push({ id: doc.id, ...doc.data() })
      })
      return { success: true, plans }
    } catch (error) {
      // 检查是否是因为缺少索引导致的错误
      if (error.message.includes('query requires an index')) {
        const indexError = '查询需要创建复合索引。请在Firebase控制台中创建所需的索引: ' + 
                          '在Firebase控制台的Firestore数据库中，转到"索引"选项卡，' + 
                          '创建一个复合索引，包含"userId"字段(升序)和"createdAt"字段(降序)。';
        return { success: false, error: indexError };
      }
      return { success: false, error: error.message }
    }
  },

  // 获取单个旅行计划
  async getTravelPlan(planId) {
    try {
      const planDoc = await getDoc(doc(db, 'travelPlans', planId))
      if (planDoc.exists()) {
        return { success: true, plan: { id: planDoc.id, ...planDoc.data() } }
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
      const planRef = doc(db, 'travelPlans', planId)
      await updateDoc(planRef, {
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
      await deleteDoc(doc(db, 'travelPlans', planId))
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 保存用户偏好设置
  async saveUserPreferences(userId, preferences) {
    try {
      const prefRef = doc(db, 'userPreferences', userId)
      await setDoc(prefRef, {
        userId,
        preferences,
        updatedAt: new Date()
      }, { merge: true })
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  },

  // 获取用户偏好设置
  async getUserPreferences(userId) {
    try {
      const prefDoc = await getDoc(doc(db, 'userPreferences', userId))
      if (prefDoc.exists()) {
        return { success: true, preferences: prefDoc.data().preferences }
      } else {
        return { success: true, preferences: {} }
      }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
}