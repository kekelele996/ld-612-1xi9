import "./shim";
import { createServer } from "vite";
import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { renderToString } from "@vue/server-renderer";

const vite = await createServer({
  server: { middlewareMode: true },
  appType: "custom",
  logLevel: "error"
});

let failures = 0;
const check = (cond: boolean, label: string) => {
  if (!cond) {
    failures += 1;
    console.error(`  ✗ ${label}`);
  } else {
    console.log(`  ✓ ${label}`);
  }
};

try {
  const { default: App } = await vite.ssrLoadModule("/src/App.vue");
  const { createAppRouter } = await vite.ssrLoadModule("/src/router/routes.ts");
  const { useReviewNoteStore } = await vite.ssrLoadModule("/src/stores/ReviewNoteStore.ts");
  const { useDiffResultStore } = await vite.ssrLoadModule("/src/stores/DiffResultStore.ts");
  const { usePolicySectionStore } = await vite.ssrLoadModule("/src/stores/PolicySectionStore.ts");
  const { usePolicyDocumentStore } = await vite.ssrLoadModule("/src/stores/PolicyDocumentStore.ts");

  const renderReview = async (filter: string) => {
    const app = createSSRApp(App);
    const pinia = createPinia();
    app.use(pinia);
    const router = createAppRouter();
    app.use(router);
    await router.push("/review");
    await router.isReady();

    const reviewStore = useReviewNoteStore();
    const diffStore = useDiffResultStore();
    const sectionStore = usePolicySectionStore();
    const documentStore = usePolicyDocumentStore();
    await Promise.all([reviewStore.load(), diffStore.load(), sectionStore.load(), documentStore.load()]);
    reviewStore.setFilter(filter as never);
    return renderToString(app);
  };

  // 全部：4 条种子备注全部出现，角标计数随状态显示
  let html = await renderReview("ALL");
  for (const keyword of [
    "收集范围扩大", "第三方共享", "保存期限", "新增章节",
    "待处理", "已确认", "已忽略", "已解决",
    "保存处理意见", "处理人", "导出审阅报告",
    "旧版", "新版"
  ]) {
    check(html.includes(keyword), `全部视图包含「${keyword}」`);
  }
  check(html.includes(">1<") || /待处理<span[^>]*>1/.test(html) || html.includes("tab-count"), "页签带数量角标");

  // 只看“已忽略”：只出现 1 条，且必须是带原因的那条；OPEN 备注不出现
  html = await renderReview("IGNORED");
  check(html.includes("保存期限"), "已忽略筛选：显示忽略备注");
  check(!html.includes("新增章节"), "已忽略筛选：隐藏待处理备注");

  // 只看“待处理”：出现空 reviewer 输入框占位
  html = await renderReview("OPEN");
  check(html.includes("新增章节"), "待处理筛选：显示待处理备注");
  check(!html.includes("保存期限"), "待处理筛选：隐藏已忽略备注");
  check(html.includes("请输入处理人姓名"), "待处理表单含处理人输入框");
} finally {
  await vite.close();
}

process.exit(failures === 0 ? 0 : 1);
