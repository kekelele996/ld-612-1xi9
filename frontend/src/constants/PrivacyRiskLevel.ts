import type {
  PrivacyRiskLevel as PrivacyRiskLevelValue,
  PrivacyRiskLevelMeta
} from "../types/PrivacyRiskLevel";

export const PrivacyRiskLevel = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const PrivacyRiskLevelText: Record<PrivacyRiskLevelValue, string> = {
  LOW: "低",
  MEDIUM: "中",
  HIGH: "高",
  CRITICAL: "严重"
};

/** 风险标注页与 RiskTag 共用的选项 */
export const PRIVACY_RISK_LEVEL_OPTIONS: PrivacyRiskLevelMeta[] = PrivacyRiskLevel.map(
  (value) => ({ value, label: PrivacyRiskLevelText[value] })
);
