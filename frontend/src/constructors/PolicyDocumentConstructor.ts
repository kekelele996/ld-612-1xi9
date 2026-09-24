import type { PolicyDocument } from "../types/PolicyDocument";

export const createDefaultPolicyDocument = (
  overrides: Partial<PolicyDocument> = {}
): PolicyDocument => ({
  id: 0,
  title: "",
  version_label: "",
  raw_text: "",
  normalized_sections: "",
  imported_at: new Date().toISOString(),
  ...overrides
});

/** 文档导入表单对象 */
export const createPolicyDocumentForm = (): PolicyDocument => createDefaultPolicyDocument();

/** 导入接口响应对象（只读视图） */
export const createPolicyDocumentResponse = (
  source: PolicyDocument
): PolicyDocument => ({ ...source });
