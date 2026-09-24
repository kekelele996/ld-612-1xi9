export const ReviewStatus = ["OPEN","CONFIRMED","IGNORED","RESOLVED"] as const;
export type ReviewStatus = (typeof ReviewStatus)[number];
export const ReviewStatusText: Record<ReviewStatus, string> = Object.fromEntries(ReviewStatus.map((value) => [value, value.replace(/_/g, " ")])) as Record<ReviewStatus, string>;
export const ReviewStatusLabel: Record<ReviewStatus, string> = {
  OPEN: "待处理",
  CONFIRMED: "已确认",
  IGNORED: "已忽略",
  RESOLVED: "已解决"
};
export const ReviewStatusFilterOptions = [
  { value: "ALL", label: "全部" },
  { value: "OPEN", label: "待处理" },
  { value: "CONFIRMED", label: "已确认" },
  { value: "IGNORED", label: "已忽略" },
  { value: "RESOLVED", label: "已解决" }
] as const;
