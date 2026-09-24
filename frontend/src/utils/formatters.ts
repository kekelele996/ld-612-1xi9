import { DiffTypeText } from "../constants/DiffType";
import { PrivacyRiskLevelText } from "../constants/PrivacyRiskLevel";
import { ReviewStatusText } from "../constants/ReviewStatus";

export const formatDate = (value: string | undefined | null) =>
  value ? new Date(value).toLocaleString("zh-CN") : "—";

export const formatStatus = (value: string) =>
  ReviewStatusText[value as keyof typeof ReviewStatusText] ?? value.replace(/_/g, " ");

export const formatDiffType = (value: string) =>
  DiffTypeText[value as keyof typeof DiffTypeText] ?? value.replace(/_/g, " ");

export const formatNumber = (value: number) => new Intl.NumberFormat("zh-CN").format(value);

export const formatRisk = (value: string) =>
  PrivacyRiskLevelText[value as keyof typeof PrivacyRiskLevelText] ?? value;

/** 文件名用时间戳：审阅报告-20260924-153000.md */
export const formatTimestampForFile = (date = new Date()) => {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}` +
    `-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`
  );
};
