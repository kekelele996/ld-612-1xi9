export const PrivacyRiskLevel = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type PrivacyRiskLevel = (typeof PrivacyRiskLevel)[number];

export interface PrivacyRiskLevelMeta {
  value: PrivacyRiskLevel;
  label: string;
}
