import { listReviewNote, saveReviewNote } from "../api/ReviewNote";
import { createReviewHistoryEntry } from "../constructors/ReviewNoteConstructor";
import { ERROR_CODES } from "../constants/errorCodes";
import { ReviewStatusText } from "../constants/ReviewStatus";
import { logOperation } from "../utils/logger";
import { ServiceError } from "../utils/errors";
import { buildSnapshotForDiff } from "./snapshotService";
import type { ReviewNote } from "../types/ReviewNote";
import type { ReviewStatus } from "../types/ReviewStatus";
import type { DiffResult } from "../types/DiffResult";
import type { PolicySection } from "../types/PolicySection";

export interface SaveReviewDraft {
  id?: number;
  diff_result_id: number;
  tag?: string;
  comment: string;
  reviewer: string;
  status: ReviewStatus;
}

export interface SaveReviewContext {
  diffs: DiffResult[];
  sectionsById: Map<number, PolicySection>;
}

/**
 * 保存一条审阅处理意见。
 * 业务规则（在 service 层校验，controller 层不重复）：
 * 1. 处理人必填；
 * 2. 状态为“已忽略”时意见（忽略原因）必填，不满足则抛错、不写库；
 * 3. 置为“已解决”时记录对应条款正文/风险等级快照；重新打开时清空快照；
 * 4. 每次保存都追加处理记录，历史永不覆盖。
 */
export async function submitReviewNote(
  draft: SaveReviewDraft,
  context: SaveReviewContext
): Promise<ReviewNote> {
  if (!draft.reviewer.trim()) {
    throw new ServiceError(ERROR_CODES.REVIEW_REVIEWER_REQUIRED);
  }
  if (draft.status === "IGNORED" && !draft.comment.trim()) {
    throw new ServiceError(ERROR_CODES.REVIEW_REASON_REQUIRED);
  }

  const rows = await listReviewNote();
  const existing = draft.id != null ? rows.find((row) => row.id === draft.id) : undefined;
  const now = new Date().toISOString();
  const reviewer = draft.reviewer.trim();
  const comment = draft.comment.trim();

  let snapshot = existing?.resolved_snapshot ?? null;
  if (draft.status === "RESOLVED") {
    const diff = context.diffs.find((item) => item.id === draft.diff_result_id);
    if (!diff) throw new ServiceError(ERROR_CODES.DIFF_NOT_FOUND, { id: draft.diff_result_id });
    snapshot = buildSnapshotForDiff(diff, context.sectionsById, now);
  }
  if (draft.status !== "RESOLVED") snapshot = null;

  const next: ReviewNote = {
    id: existing?.id ?? draft.id ?? 0,
    diff_result_id: draft.diff_result_id,
    tag: draft.tag?.trim() || existing?.tag || "",
    comment,
    reviewer,
    status: draft.status,
    created_at: existing?.created_at ?? now,
    updated_at: now,
    history: [
      ...(existing?.history ?? []),
      createReviewHistoryEntry(draft.status, reviewer, comment, now)
    ],
    resolved_snapshot: snapshot
  };

  const saved = await saveReviewNote(next);
  logOperation("ReviewNote", existing ? "statusChange" : "create", {
    id: saved.id,
    diffId: saved.diff_result_id,
    actor: reviewer,
    from: existing?.status ?? "-",
    to: ReviewStatusText[saved.status]
  });
  return saved;
}

export async function getAllReviewNotes(): Promise<ReviewNote[]> {
  return listReviewNote();
}
