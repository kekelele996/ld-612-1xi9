import { listPolicySection, savePolicySection } from "../api/PolicySection";
import { listDiffResult } from "../api/DiffResult";
import { logOperation } from "../utils/logger";
import { ServiceError } from "../utils/errors";
import { ERROR_CODES } from "../constants/errorCodes";
import { reopenResolvedNotes } from "./reopenService";
import type { PolicySection } from "../types/PolicySection";

export interface SectionUpdatePayload {
  id: number;
  content?: string;
  risk_level?: PolicySection["risk_level"];
  heading?: string;
  category?: string;
}

/**
 * 修改条款正文或风险等级并保存到本机，随后执行联动检查：
 * 凡引用该条款、且状态为“已解决”的审阅备注，一律退回“待处理”并保留处理记录。
 */
export async function updatePolicySection(
  payload: SectionUpdatePayload
): Promise<{ section: PolicySection; reopenedCount: number }> {
  const sections = await listPolicySection();
  const current = sections.find((row) => row.id === payload.id);
  if (!current) {
    throw new ServiceError(ERROR_CODES.SECTION_NOT_FOUND, { id: payload.id });
  }

  const changedFields: string[] = [];
  if (payload.content != null && payload.content !== current.content) changedFields.push("正文");
  if (payload.risk_level != null && payload.risk_level !== current.risk_level) changedFields.push("风险等级");
  if (payload.heading != null && payload.heading !== current.heading) changedFields.push("标题");
  if (payload.category != null && payload.category !== current.category) changedFields.push("类别");

  const next: PolicySection = {
    ...current,
    ...payload,
    updated_at: new Date().toISOString()
  } as PolicySection;
  const saved = await savePolicySection(next);

  logOperation("PolicySection", "update", {
    id: saved.id,
    fields: changedFields.join("、") || "无变化"
  });
  if (payload.risk_level && payload.risk_level !== current.risk_level) {
    logOperation("PolicySection", "statusChange", {
      id: saved.id,
      from: current.risk_level,
      to: payload.risk_level
    });
  }

  // 条款变化联动：仅在正文或风险等级变化时退回已解决备注
  const affectsResolution = changedFields.includes("正文") || changedFields.includes("风险等级");
  let reopenedCount = 0;
  if (affectsResolution) {
    const latestSections = await listPolicySection();
    const sectionsById = new Map(latestSections.map((section) => [section.id, section]));
    const diffs = await listDiffResult();
    const relatedDiffs = diffs.filter(
      (diff) => diff.old_section_id === saved.id || diff.new_section_id === saved.id
    );
    const reopened = await reopenResolvedNotes(relatedDiffs, sectionsById);
    reopenedCount = reopened.length;
  }

  return { section: saved, reopenedCount };
}

export async function getAllSections(): Promise<PolicySection[]> {
  return listPolicySection();
}
