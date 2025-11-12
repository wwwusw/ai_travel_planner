import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import TravelPlanner from '../views/TravelPlanner.vue'
import TravelHistory from '../views/TravelHistory.vue'
import TravelPlanDetail from '../views/TravelPlanDetail.vue'
import TestFirestore from '../views/TestFirestore.vue'
import FirebaseConfigGuide from '../views/FirebaseConfigGuide.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/planner', component: TravelPlanner },
  { path: '/history', component: TravelHistory },
  { path: '/plan/:id', component: TravelPlanDetail, props: true },
  { path: '/test', component: TestFirestore },
  { path: '/firebase-config', component: FirebaseConfigGuide }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router