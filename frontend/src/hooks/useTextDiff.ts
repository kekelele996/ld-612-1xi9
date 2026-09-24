import type { DiffResult } from "../types/DiffResult";
import type { PolicySection } from "../types/PolicySection";
import { createDiffResultForm } from "../constructors/DiffResultConstructor";

export interface TextDiffOptions {
  oldDocumentId: number;
  newDocumentId: number;
}

/**
 * 按条款编号对齐新旧两版条款，产出差异结果：
 * - 新版有、旧版无：ADDED
 * - 旧版有、新版无：REMOVED
 * - 编号相同且正文/标题/风险变化：MODIFIED
 * - 编号变化且标题在新版仍存在：MOVED
 */
export function useTextDiff() {
  const diff = (oldSections: PolicySection[], newSections: PolicySection[], options: TextDiffOptions): DiffResult[] => {
    const now = new Date().toISOString();
    const oldByNo = new Map(oldSections.map((section) => [section.section_no, section]));
    const newByNo = new Map(newSections.map((section) => [section.section_no, section]));
    const newHeadings = new Map(newSections.map((section) => [section.heading, section]));
    const results: DiffResult[] = [];

    for (const next of newSections) {
      const prev = oldByNo.get(next.section_no);
      if (!prev) {
        results.push(
          createDiffResultForm({
            old_document_id: options.oldDocumentId,
            new_document_id: options.newDocumentId,
            section_id: next.id,
            old_section_id: null,
            new_section_id: next.id,
            diff_type: "ADDED",
            summary: `新增条款 ${next.section_no}《${next.heading}》。`,
            created_at: now
          })
        );
        continue;
      }
      if (prev.heading !== next.heading || prev.content !== next.content || prev.risk_level !== next.risk_level) {
        const changes: string[] = [];
        if (prev.heading !== next.heading) changes.push("标题变化");
        if (prev.content !== next.content) changes.push("正文变化");
        if (prev.risk_level !== next.risk_level) changes.push(`风险等级 ${prev.risk_level}→${next.risk_level}`);
        results.push(
          createDiffResultForm({
            old_document_id: options.oldDocumentId,
            new_document_id: options.newDocumentId,
            section_id: next.id,
            old_section_id: prev.id,
            new_section_id: next.id,
            diff_type: "MODIFIED",
            summary: `条款 ${next.section_no}《${next.heading}》：${changes.join("、")}。`,
            created_at: now
          })
        );
      }
    }

    for (const prev of oldSections) {
      if (newByNo.has(prev.section_no)) continue;
      const movedTo = newHeadings.get(prev.heading);
      results.push(
        createDiffResultForm({
          old_document_id: options.oldDocumentId,
          new_document_id: options.newDocumentId,
          section_id: movedTo?.id ?? prev.id,
          old_section_id: prev.id,
          new_section_id: movedTo?.id ?? null,
          diff_type: movedTo ? "MOVED" : "REMOVED",
          summary: movedTo
            ? `条款《${prev.heading}》编号由 ${prev.section_no} 调整为 ${movedTo.section_no}。`
            : `删除条款 ${prev.section_no}《${prev.heading}》。`,
          created_at: now
        })
      );
    }

    return results.sort((a, b) => String(a.section_id).localeCompare(String(b.section_id)));
  };

  return { diff };
}
