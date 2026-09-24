# 隐私政策差异对比器

纯前端隐私政策版本对比与风险标注工具，用户粘贴两版文本后查看条款差异、风险标签和审阅清单，数据存 localStorage。

## 审阅工作流（核心规则）

- 左侧导航四个入口均已接通真实页面（vue-router，hash 路由，默认进入「审阅清单」）。
- 审阅清单按 **待处理 / 已确认 / 已忽略 / 已解决** 四种状态筛选，页签角标与顶部统计实时反映各状态数量。
- 填写处理人、状态和意见后保存到本机（localStorage），保存后列表数量与状态立即更新，全部处理记录按时间追加保留、不覆盖。
- 选择 **已忽略** 但未填写原因（意见）时，前后端双层校验拦截，**不会保存**；处理人为空同样拦截。
- **已解决** 备注会保存对应新旧条款的正文与风险等级快照；之后该差异对应条款正文或风险等级发生变化（风险标注页编辑或重新对比）时，自动 **退回待处理**，并在处理记录中追加一条系统退回记录，之前的处理人与意见全部保留。
- 导出审阅报告为 Markdown 文件（`审阅报告-时间戳.md`），每条包含旧版条款、新版条款、差异摘要、状态、处理人、最近处理时间、处理意见及完整处理记录；导出按当前状态筛选生效。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20112>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`
- 类型检查与构建：`cd frontend && npm run build`
- 业务规则冒烟测试（localStorage 版，覆盖保存校验/退回联动/导出）：`cd frontend && npm run smoke`
- 页面 SSR 渲染检查：`npm run check:ssr`、审阅清单数据渲染检查：`npm run check:review`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | Vue 3 + TypeScript + Vite + Element Plus + Pinia + localStorage |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/
├── api/                  # 按模型分文件封装 async API，底层走 localStorage
├── controllers/          # ReviewController / RiskController，包装 service 异常
├── services/             # ReviewService、snapshotService、reopenService、DiffResultService 等
├── stores/               # Pinia 独立 store（筛选、数量、列表）
├── types/                # 数据模型与枚举类型
├── constants/            # 枚举、日志模板、错误码/错误消息、状态文案、筛选选项
├── constructors/         # 默认对象、表单对象、响应对象、处理记录构造器
├── components/common/    # ImportPanel、DiffViewer、RiskTag、ReviewChecklist、SectionCard、StatusBadge 等
├── hooks/                # useTextDiff、usePolicyParser、useLocalStorageState
├── pages/                # DocumentsPage / ComparePage / RisksPage / ReviewPage
├── router/               # vue-router（hash 历史，四个入口 + 默认重定向 /review）
├── utils/                # formatters、localStorage 封装、logger、errors
└── mocks/                # 种子数据（旧版 v2025 / 新版 v2026 隐私政策与差异、审阅备注）
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `policy-diff`
- `FRONTEND_PORT`: 前端端口，默认 `20112`


## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: policy-diff`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-policy-diff}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- DiffType：`constants/DiffType.ts`（含 DIFF_TYPE_FILTERS）、`types/DiffType.ts`、`constants/statusText.ts`、`constructors/DiffResultConstructor.ts`、`constants/logTemplates.ts`、`utils/formatters.ts`、版本对比页筛选器与 `DiffViewer.vue`、`services/DiffResultService.ts` 与 `hooks/useTextDiff.ts`。
- PrivacyRiskLevel：`constants/PrivacyRiskLevel.ts`（含 PRIVACY_RISK_LEVEL_OPTIONS）、`types/PrivacyRiskLevel.ts`、`constants/statusText.ts`、`constructors/PolicySectionConstructor.ts`、`hooks/usePolicyParser.ts`、`utils/formatters.ts`、风险标注页与 `RiskTag.vue`、`services/snapshotService.ts` 与 `services/reopenService.ts`（快照与退回判定）。
- ReviewStatus：`constants/ReviewStatus.ts`（含 REVIEW_STATUS_FILTERS）、`types/ReviewStatus.ts`、`constants/statusText.ts`、`constructors/ReviewNoteConstructor.ts`、`constants/logTemplates.ts`、`constants/errorMessages.ts`、`utils/formatters.ts`、审阅清单筛选器与 `StatusBadge.vue`/`ReviewChecklist.vue`、`services/ReviewService.ts`、`services/reopenService.ts`、`controllers/ReviewController.ts`、审阅报告导出。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
