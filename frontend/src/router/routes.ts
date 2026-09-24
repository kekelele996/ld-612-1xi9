import {
  createRouter,
  createWebHashHistory,
  createMemoryHistory,
  type RouteRecordRaw
} from "vue-router";
import DocumentsPage from "../pages/DocumentsPage.vue";
import ComparePage from "../pages/ComparePage.vue";
import RisksPage from "../pages/RisksPage.vue";
import ReviewPage from "../pages/ReviewPage.vue";

/** 左侧入口（按需求顺序） */
export const navRoutes = [
  { name: "文档导入", path: "/documents" },
  { name: "版本对比", path: "/compare" },
  { name: "风险标注", path: "/risks" },
  { name: "审阅清单", path: "/review" }
] as const;

const routes: RouteRecordRaw[] = [
  { path: "/", redirect: "/review" },
  { path: "/documents", name: "文档导入", component: DocumentsPage },
  { path: "/compare", name: "版本对比", component: ComparePage },
  { path: "/risks", name: "风险标注", component: RisksPage },
  { path: "/review", name: "审阅清单", component: ReviewPage }
];

export const createAppRouter = () =>
  createRouter({
    history: typeof window === "undefined" ? createMemoryHistory("/") : createWebHashHistory(),
    routes
  });

const router = createAppRouter();

export default router;
