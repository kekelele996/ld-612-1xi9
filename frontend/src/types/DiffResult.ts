import type { DiffType } from "./DiffType";

export interface DiffResult {
  id: number;
  old_document_id: number;
  new_document_id: number;
  section_id: number;
  diff_type: DiffType;
  summary: string;
  created_at: string;
}
