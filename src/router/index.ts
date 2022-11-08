import Admin from '@/views/Admin.vue'
import Questionnaire from '@/views/Questionnaire.vue'
import Thankyou from '@/views/Thankyou.vue'
import Waiting from '@/views/Waiting.vue'
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import Home from '../views/Home.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/admin',
    name: 'admin',
    component: Admin
  },
  {
    path: '/questionnaire',
    name: 'questionnaire',
    component: Questionnaire
  },
  {
    path: '/thankyou',
    name: 'thankyou',
    component: Thankyou
  },
  {
    path: '/waiting',
    name: 'waiting',
    component: Waiting
  }
]

const router = createRouter({
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 }
  },
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
