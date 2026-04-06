import { createRouter, createWebHistory } from "vue-router";
import MainLayout from "../views/MainLayout.vue";
import HomeView from "../views/HomeView.vue";
import SavedView from "../views/SavedView.vue";
import AddPlaceView from "../views/AddPlaceView.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: MainLayout,
      children: [
        {
          path: "",
          name: "home",
          component: HomeView,
          meta: { subtitle: "Find a calm corner on campus" },
        },
        {
          path: "saved",
          name: "saved",
          component: SavedView,
          meta: { subtitle: "Your saved quiet places" },
        },
        {
          path: "add-place",
          name: "add-place",
          component: AddPlaceView,
          meta: { subtitle: "Share a new quiet place" },
        },
      ],
    },
  ],
});

export default router;