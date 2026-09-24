import type { ReviewStatus } from "./ReviewStatus";

export interface ReviewNoteHistoryEntry {
  status: ReviewStatus;
  reviewer: string;
  comment: string;
  reason: string;
  changed_at: string;
}

export interface ReviewNote {
  id: number;
  diff_result_id: number;
  tag: string;
  comment: string;
  reviewer: string;
  status: ReviewStatus;
  reason: string;
  resolved_section_id: number | null;
  resolved_section_content: string;
  resolved_risk_level: string;
  history: ReviewNoteHistoryEntry[];
  created_at: string;
  updated_at: string;
}
