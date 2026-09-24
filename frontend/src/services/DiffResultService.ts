import { listDiffResult, replaceDiffResults } from "../api/DiffResult";
import { listPolicySection } from "../api/PolicySection";
import { nextLocalId } from "../utils/localStorage";
import { logOperation } from "../utils/logger";
import { useTextDiff } from "../hooks/useTextDiff";
import { reopenResolvedNotes } from "./reopenService";
import type { DiffResult } from "../types/DiffResult";

const diffKey = (diff: DiffResult) =>
  `${diff.old_section_id ?? "x"}->${diff.new_section_id ?? "x"}:${diff.diff_type}`;

/**
 * 对两版文档重新执行差异对比并保存。
 * id 按（旧条款、新条款、差异类型）稳定复用，保证审阅备注的 diff_result_id 不断链；
 * 仅对真正新出现的差异分配新 id。对比结果变化同样触发已解决备注退回检查。
 */
export async function runVersionDiff(
  oldDocumentId: number,
  newDocumentId: number
): Promise<{ diffs: DiffResult[]; reopenedCount: number }> {
  const allSections = await listPolicySection();
  const oldSections = allSections.filter((section) => section.document_id === oldDocumentId);
  const newSections = allSections.filter((section) => section.document_id === newDocumentId);

  const { diff } = useTextDiff();
  const computed = diff(oldSections, newSections, { oldDocumentId, newDocumentId });

  const existing = await listDiffResult();
  const existingByKey = new Map(existing.map((item) => [diffKey(item), item]));
  let nextId = nextLocalId(existing);

  const diffs: DiffResult[] = computed.map((item) => {
    const matched = existingByKey.get(diffKey(item));
    if (matched) {
      return {
        ...item,
        id: matched.id,
        // 摘要沿用最新计算结果，创建时间保留首次发现时间
        created_at: matched.created_at
      };
    }
    return { ...item, id: nextId++ };
  });

  replaceDiffResults(diffs);
  logOperation("DiffResult", "create", { id: diffs.length, diffType: "重新对比" });

  const sectionsById = new Map(allSections.map((section) => [section.id, section]));
  const reopened = await reopenResolvedNotes(diffs, sectionsById);

  return { diffs, reopenedCount: reopened.length };
}

export async function getAllDiffs(): Promise<DiffResult[]> {
  return listDiffResult();
}
