import type { PolicySection } from "../types/PolicySection";

export const createDefaultPolicySection = (
  overrides: Partial<PolicySection> = {}
): PolicySection => ({
  id: 0,
  document_id: 0,
  section_no: "",
  heading: "",
  content: "",
  category: "数据收集",
  risk_level: "LOW",
  updated_at: new Date().toISOString(),
  ...overrides
});

/** 解析条款时的表单对象 */
export const createPolicySectionForm = (
  overrides: Partial<PolicySection> = {}
): PolicySection => createDefaultPolicySection(overrides);

export const createPolicySectionResponse = (
  source: PolicySection
): PolicySection => ({ ...source });
