export const LOG_TEMPLATES = {
  PolicyDocument: {
    create: "政策文档创建",
    update: "政策文档更新",
    statusChange: "政策文档状态变更",
    export: "政策文档导出"
  },
  PolicySection: {
    create: "条款段落创建",
    update: "条款段落更新",
    statusChange: "条款段落状态变更",
    export: "条款段落导出"
  },
  DiffResult: {
    create: "差异结果创建",
    update: "差异结果更新",
    statusChange: "差异结果状态变更",
    export: "差异结果导出"
  },
  ReviewNote: {
    create: "审阅备注创建",
    update: "审阅备注更新",
    statusChange: "审阅备注状态变更",
    export: "审阅备注导出",
    reopen: "审阅备注退回待处理",
    invalid: "审阅备注校验失败"
  }
} as const;
