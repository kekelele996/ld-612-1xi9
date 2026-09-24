import type { ReviewStatus as ReviewStatusValue, ReviewStatusMeta } from "../types/ReviewStatus";

export const ReviewStatus = ["OPEN", "CONFIRMED", "IGNORED", "RESOLVED"] as const;

/** 审阅状态中文文案：筛选器、StatusBadge、导出报告共用 */
export const ReviewStatusText: Record<ReviewStatusValue, string> = {
  OPEN: "待处理",
  CONFIRMED: "已确认",
  IGNORED: "已忽略",
  RESOLVED: "已解决"
};

/** 审阅清单状态筛选选项（顺序即页签顺序） */
export const REVIEW_STATUS_FILTERS: ReviewStatusMeta[] = ReviewStatus.map((value) => ({
  value,
  label: ReviewStatusText[value]
}));
