/**
 * 日志模板集中存放，每个实体至少 4 条。
 * 写操作（创建/更新/状态变更/导出）在 service 层调用 logOperation 记录。
 * {field}、{id}、{actor} 等占位由 logOperation 填充。
 */
export const LOG_TEMPLATES = {
  PolicyDocument: {
    create: "政策文档创建：id={id}，版本={version}",
    update: "政策文档更新：id={id}，变更字段={fields}",
    statusChange: "政策文档状态变更：id={id}，{from}→{to}",
    export: "政策文档导出：共{count}条记录，操作人={actor}"
  },
  PolicySection: {
    create: "条款段落创建：id={id}，编号={sectionNo}",
    update: "条款段落更新：id={id}，变更字段={fields}",
    statusChange: "条款段落风险等级变更：id={id}，{from}→{to}",
    export: "条款段落导出：共{count}条记录，操作人={actor}"
  },
  DiffResult: {
    create: "差异结果创建：id={id}，类型={diffType}",
    update: "差异结果更新：id={id}，变更字段={fields}",
    statusChange: "差异结果状态变更：id={id}，{from}→{to}",
    export: "差异结果导出：共{count}条记录，操作人={actor}"
  },
  ReviewNote: {
    create: "审阅备注创建：id={id}，差异={diffId}，处理人={actor}",
    update: "审阅备注更新：id={id}，变更字段={fields}",
    statusChange: "审阅备注状态变更：id={id}，{from}→{to}，处理人={actor}",
    export: "审阅备注导出：共{count}条记录，操作人={actor}"
  }
} as const;

export type LogEntity = keyof typeof LOG_TEMPLATES;
export type LogAction = "create" | "update" | "statusChange" | "export";
