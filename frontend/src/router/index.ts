import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/review" },
    ...routes.map((item) => ({ path: item.route, component: item.component }))
  ]
});
