import { ERROR_CODES } from "./errorCodes";

/** 错误消息模板，与错误码一一对应；{field} 等占位由调用方填充 */
export const ERROR_MESSAGES: Record<(typeof ERROR_CODES)[keyof typeof ERROR_CODES], string> = {
  [ERROR_CODES.VALIDATION_FAILED]: "表单字段缺失或格式错误：{field}",
  [ERROR_CODES.REVIEW_REASON_REQUIRED]: "选择“已忽略”时必须填写忽略原因，请补充意见后再保存",
  [ERROR_CODES.REVIEW_REVIEWER_REQUIRED]: "请填写处理人后再保存",
  [ERROR_CODES.REVIEW_NOTE_NOT_FOUND]: "未找到 id={id} 的审阅备注",
  [ERROR_CODES.SECTION_NOT_FOUND]: "未找到 id={id} 的条款段落",
  [ERROR_CODES.DIFF_NOT_FOUND]: "未找到 id={id} 的差异结果",
  [ERROR_CODES.RATE_LIMITED]: "请求过于频繁，请稍后再试"
};

/** 已解决备注因条款变化被系统退回待处理时的提示文案 */
export const REVIEW_REOPEN_MESSAGE =
  "对应条款正文或风险等级已变化，系统自动将状态由“已解决”退回“待处理”，原处理记录已保留";
