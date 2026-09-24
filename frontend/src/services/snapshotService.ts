import type { DiffResult } from "../types/DiffResult";
import type { PolicySection } from "../types/PolicySection";
import type { ResolvedSnapshot } from "../types/ReviewNote";

/**
 * 构造某条差异对应新旧条款的正文/风险等级快照。
 * 已解决备注用它记录“解决那一刻”的条款内容，之后条款变化即可识别并退回待处理。
 */
export function buildSnapshotForDiff(
  diff: DiffResult,
  sectionsById: Map<number, PolicySection>,
  resolvedAt = new Date().toISOString()
): ResolvedSnapshot {
  const oldSection = diff.old_section_id != null ? sectionsById.get(diff.old_section_id) : undefined;
  const newSection = diff.new_section_id != null ? sectionsById.get(diff.new_section_id) : undefined;
  return {
    old_content: oldSection?.content ?? "（旧版无对应条款）",
    old_risk_level: oldSection?.risk_level ?? "—",
    new_content: newSection?.content ?? "（新版无对应条款）",
    new_risk_level: newSection?.risk_level ?? "—",
    resolved_at: resolvedAt
  };
}
