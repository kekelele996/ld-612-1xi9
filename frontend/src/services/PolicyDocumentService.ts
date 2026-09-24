import { listPolicyDocument, savePolicyDocument } from "../api/PolicyDocument";
import { appendPolicySections, listPolicySection } from "../api/PolicySection";
import { logOperation } from "../utils/logger";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { PolicySection } from "../types/PolicySection";

export interface ImportPayload {
  title: string;
  version_label: string;
  raw_text: string;
}

/**
 * 导入一份政策版本：保存文档 + 自动分段条款，全部落本机 localStorage。
 */
export async function importPolicyDocument(
  payload: ImportPayload,
  parsedSections: PolicySection[]
): Promise<{ document: PolicyDocument; sections: PolicySection[] }> {
  const now = new Date().toISOString();
  const saved = await savePolicyDocument({
    id: 0,
    title: payload.title.trim() || "未命名隐私政策",
    version_label: payload.version_label.trim() || "未标注版本",
    raw_text: payload.raw_text,
    normalized_sections: parsedSections.map((section) => section.section_no).join(","),
    imported_at: now
  });

  const sectionsWithDoc = parsedSections.map((section) => ({
    ...section,
    document_id: saved.id,
    updated_at: now
  }));
  const allSections = appendPolicySections(sectionsWithDoc);

  logOperation("PolicyDocument", "create", { id: saved.id, version: saved.version_label });
  logOperation("PolicySection", "create", {
    id: sectionsWithDoc.map((section) => section.section_no).join("/"),
    sectionNo: sectionsWithDoc.length
  });

  return { document: saved, sections: allSections };
}

export async function getAllDocuments(): Promise<PolicyDocument[]> {
  return listPolicyDocument();
}

export async function getSectionsByDocument(documentId: number): Promise<PolicySection[]> {
  const sections = await listPolicySection();
  return sections.filter((section) => section.document_id === documentId);
}
