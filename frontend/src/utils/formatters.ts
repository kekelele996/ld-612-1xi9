import { ReviewStatusLabel } from "../constants/ReviewStatus";
import type { ReviewStatus } from "../types/ReviewStatus";

const RISK_TEXT: Record<string, string> = { LOW: "低", MEDIUM: "中", HIGH: "高", CRITICAL: "严重", EXTREME: "极高" };

export const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { hour12: false });
};
export const formatStatus = (value: string) => value.replace(/_/g, " ");
export const formatReviewStatus = (value: string) => ReviewStatusLabel[value as ReviewStatus] ?? formatStatus(value);
export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);
export const formatRisk = (value: string) => RISK_TEXT[value] ?? value;
