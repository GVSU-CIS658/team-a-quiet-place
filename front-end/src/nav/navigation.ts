// src/nav/nav.ts
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignupView.vue'
import ConnorView from '../views/ConnorView.vue'
import { useAuthStore } from '../pinia/authentication'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/signup',
      name: 'signup',
      component: SignupView,
    },
    {
      path: '/connor',
      name: 'connor',
      component: ConnorView,
    },

  ],
})

// router.beforeEach((to) => {
//   const authStore = useAuthStore()

//   if (!authStore.initialized) {
//     return true
//   }

//   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
//     return '/login'
//   }

//   if ((to.path === '/login' || to.path === '/signup') && authStore.isAuthenticated) {
//     return '/'
//   }

//   return true
// })

export default router