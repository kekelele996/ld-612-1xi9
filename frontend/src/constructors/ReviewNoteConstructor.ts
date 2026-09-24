import type { ReviewNote } from "../types/ReviewNote";

export const createDefaultReviewNote = (overrides: Partial<ReviewNote> = {}): ReviewNote => ({
  id: 0,
  diff_result_id: 0,
  tag: "",
  comment: "",
  reviewer: "",
  status: "OPEN",
  reason: "",
  resolved_section_id: null,
  resolved_section_content: "",
  resolved_risk_level: "",
  history: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides
});

export const createReviewNoteForm = createDefaultReviewNote;
export const createReviewNoteResponse = createDefaultReviewNote;
