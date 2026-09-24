import DocumentsPage from "../pages/DocumentsPage.vue";
import ComparePage from "../pages/ComparePage.vue";
import RisksPage from "../pages/RisksPage.vue";
import ReviewPage from "../pages/ReviewPage.vue";

export const routes = [
  {
    name: "文档导入",
    route: "/documents",
    component: DocumentsPage
  },
  {
    name: "版本对比",
    route: "/compare",
    component: ComparePage
  },
  {
    name: "风险标注",
    route: "/risks",
    component: RisksPage
  },
  {
    name: "审阅清单",
    route: "/review",
    component: ReviewPage
  }
] as const;
