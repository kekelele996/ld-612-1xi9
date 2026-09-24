import type { DiffType } from "./DiffType";

export interface DiffResult {
  id: number;
  old_document_id: number;
  new_document_id: number;
  section_id: number;
  /** 旧版对应条款 id；新增条款时为 null */
  old_section_id: number | null;
  /** 新版对应条款 id；删除条款时为 null */
  new_section_id: number | null;
  diff_type: DiffType;
  summary: string;
  created_at: string;
}
