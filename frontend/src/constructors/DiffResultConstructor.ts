import type { DiffResult } from "../types/DiffResult";

export const createDefaultDiffResult = (
  overrides: Partial<DiffResult> = {}
): DiffResult => ({
  id: 0,
  old_document_id: 0,
  new_document_id: 0,
  section_id: 0,
  old_section_id: null,
  new_section_id: null,
  diff_type: "MODIFIED",
  summary: "",
  created_at: new Date().toISOString(),
  ...overrides
});

/** 对比计算产生的差异对象 */
export const createDiffResultForm = (
  overrides: Partial<DiffResult> = {}
): DiffResult => createDefaultDiffResult(overrides);

export const createDiffResultResponse = (source: DiffResult): DiffResult => ({ ...source });
