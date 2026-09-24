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

try {
  const { default: App } = await vite.ssrLoadModule("/src/App.vue");
  const { createAppRouter } = await vite.ssrLoadModule("/src/router/routes.ts");

  for (const path of ["/review", "/documents", "/compare", "/risks"]) {
    const app = createSSRApp(App);
    app.use(createPinia());
    const router = createAppRouter();
    app.use(router);
    await router.push(path);
    await router.isReady();
    const html = await renderToString(app);
    if (!html.includes("shell")) throw new Error(`${path} 未渲染应用外壳`);
    if (path === "/review" && !html.includes("导出审阅报告")) {
      throw new Error("/review 缺少导出入口");
    }
    if (path === "/review" && !html.includes("待处理")) {
      throw new Error("/review 缺少状态筛选页签");
    }
    console.log(`  ✓ ${path} SSR 渲染通过（${html.length} 字符）`);
  }
  console.log("\n全部页面 SSR 冒烟通过。");
} finally {
  await vite.close();
}
process.exit(0);
