import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "home", component: HomeView },
    {
      path: "/log-in",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/log-out",
      name: "logout",
      component: () => import("../views/LogoutView.vue"),
    },
    {
      path: "/songs/:id",
      name: "play",
      component: () => import("../views/PlayView.vue"),
    },
    {
      path: "/faq",
      name: "faq",
      component: () => import("../views/FaqView.vue"),
    },
  ],
});

export default router;
