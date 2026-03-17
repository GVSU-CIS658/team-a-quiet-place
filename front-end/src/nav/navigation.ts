// src/nav/navigation.ts
import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import SignupView from "../views/SignupView.vue";
import SavedView from "../views/SavedView.vue";
import TestView from "../views/TestView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: "/login",
      name: "login",
      component: LoginView,
    },
    {
      path: "/signup",
      name: "signup",
      component: SignupView,
    },
    {
      path: "/saved",
      name: "saved",
      component: SavedView,
    },
    {
      path: "/test",
      name: "test",
      component: TestView,
    },
  ],
});

export default router;

// import { useAuthStore } from "../pinia/authentication";

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
