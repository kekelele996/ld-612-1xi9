import type { ReviewHistoryEntry, ReviewNote } from "../types/ReviewNote";
import type { ReviewStatus } from "../types/ReviewStatus";

export const createDefaultReviewNote = (
  overrides: Partial<ReviewNote> = {}
): ReviewNote => ({
  id: 0,
  diff_result_id: 0,
  tag: "",
  comment: "",
  reviewer: "",
  status: "OPEN",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  history: [],
  resolved_snapshot: null,
  ...overrides
});

/** 清单中“新建处理意见”的表单对象 */
export const createReviewNoteForm = (
  overrides: Partial<ReviewNote> = {}
): ReviewNote => createDefaultReviewNote(overrides);

export const createReviewNoteResponse = (source: ReviewNote): ReviewNote => ({
  ...source,
  history: source.history.map((entry) => ({ ...entry })),
  resolved_snapshot: source.resolved_snapshot ? { ...source.resolved_snapshot } : null
});

/** 每次保存时追加一条处理记录（退回待处理也通过此构造器留痕） */
export const createReviewHistoryEntry = (
  status: ReviewStatus,
  reviewer: string,
  comment: string,
  actedAt = new Date().toISOString()
): ReviewHistoryEntry => ({ status, reviewer, comment, acted_at: actedAt });
