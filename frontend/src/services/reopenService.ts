import type { DiffResult } from "../types/DiffResult";
import type { PolicySection } from "../types/PolicySection";
import type { ReviewNote } from "../types/ReviewNote";
import { createReviewHistoryEntry } from "../constructors/ReviewNoteConstructor";
import { REVIEW_REOPEN_MESSAGE } from "../constants/errorMessages";
import { listReviewNote, saveReviewNote } from "../api/ReviewNote";

/**
 * 已解决备注退回规则：
 * 当某条差异对应的旧版/新版条款正文或风险等级与解决时快照不一致时，
 * 把 RESOLVED 备注退回 OPEN，并追加一条“系统”处理记录，保留全部历史。
 */
export async function reopenResolvedNotes(
  diffs: DiffResult[],
  sectionsById: Map<number, PolicySection>,
  actor = "系统"
): Promise<ReviewNote[]> {
  const reopened: ReviewNote[] = [];
  const notes = await listReviewNote();

  for (const note of notes) {
    if (note.status !== "RESOLVED" || !note.resolved_snapshot) continue;
    const diff = diffs.find((item) => item.id === note.diff_result_id);
    if (!diff) continue;

    const oldSection = diff.old_section_id != null ? sectionsById.get(diff.old_section_id) : undefined;
    const newSection = diff.new_section_id != null ? sectionsById.get(diff.new_section_id) : undefined;

    const oldChanged =
      oldSection &&
      (oldSection.content !== note.resolved_snapshot.old_content ||
        oldSection.risk_level !== note.resolved_snapshot.old_risk_level);
    const newChanged =
      newSection &&
      (newSection.content !== note.resolved_snapshot.new_content ||
        newSection.risk_level !== note.resolved_snapshot.new_risk_level);
    // 新增条款（无旧版）或删除条款（无新版）时，只要存在的一侧变化即退回
    const onlyNewChanged = !oldSection && newChanged;
    const onlyOldChanged = !newSection && oldChanged;

    if (oldChanged || newChanged || onlyNewChanged || onlyOldChanged) {
      const now = new Date().toISOString();
      const next: ReviewNote = {
        ...note,
        status: "OPEN",
        updated_at: now,
        history: [
          ...note.history,
          createReviewHistoryEntry("OPEN", actor, REVIEW_REOPEN_MESSAGE, now)
        ],
        resolved_snapshot: null
      };
      const saved = await saveReviewNote(next);
      reopened.push(saved);
    }
  }
  return reopened;
}
