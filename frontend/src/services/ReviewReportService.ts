import { formatDate, formatRisk, formatDiffType, formatStatus, formatTimestampForFile } from "../utils/formatters";
import { logOperation } from "../utils/logger";
import type { DiffResult } from "../types/DiffResult";
import type { PolicyDocument } from "../types/PolicyDocument";
import type { PolicySection } from "../types/PolicySection";
import type { ReviewNote } from "../types/ReviewNote";

export interface ReviewReportContext {
  notes: ReviewNote[];
  diffs: DiffResult[];
  sectionsById: Map<number, PolicySection>;
  documents: PolicyDocument[];
  /** 导出时生效的状态筛选标签，用于报告标题 */
  filterLabel?: string;
  actor?: string;
}

/**
 * 生成审阅报告 Markdown：含旧版、新版、差异摘要、状态、处理人、时间和意见。
 */
export function buildReviewReport(context: ReviewReportContext): string {
  const exportedAt = new Date();
  const oldDoc = context.documents[0];
  const newDoc = context.documents[1] ?? context.documents[0];
  const lines: string[] = [];

  lines.push(`# 隐私政策审阅报告`);
  lines.push("");
  lines.push(`- 导出时间：${formatDate(exportedAt.toISOString())}`);
  lines.push(`- 旧版：${oldDoc?.title ?? "—"} ${oldDoc?.version_label ?? ""}`.trim());
  lines.push(`- 新版：${newDoc?.title ?? "—"} ${newDoc?.version_label ?? ""}`.trim());
  if (context.filterLabel) lines.push(`- 状态筛选：${context.filterLabel}`);
  lines.push(`- 备注数量：${context.notes.length} 条`);
  lines.push("");

  context.notes.forEach((note, index) => {
    const diff = context.diffs.find((item) => item.id === note.diff_result_id);
    const oldSection = diff?.old_section_id != null ? context.sectionsById.get(diff.old_section_id) : undefined;
    const newSection = diff?.new_section_id != null ? context.sectionsById.get(diff.new_section_id) : undefined;

    lines.push(`## ${index + 1}. ${note.tag || "未命名差异"}（${formatDiffType(diff?.diff_type ?? "")}）`);
    lines.push("");
    lines.push(`- **状态**：${formatStatus(note.status)}`);
    lines.push(`- **处理人**：${note.reviewer || "—"}`);
    lines.push(`- **最近处理时间**：${formatDate(note.updated_at)}`);
    lines.push(`- **差异摘要**：${diff?.summary ?? "—"}`);
    lines.push("");
    lines.push(`**旧版条款**${oldSection ? `（${oldSection.section_no} ${oldSection.heading}，风险：${formatRisk(oldSection.risk_level)}）` : "（旧版无对应条款，新增）"}`);
    lines.push("");
    lines.push("> " + (oldSection?.content ?? "—").replace(/\n/g, "\n> "));
    lines.push("");
    lines.push(`**新版条款**${newSection ? `（${newSection.section_no} ${newSection.heading}，风险：${formatRisk(newSection.risk_level)}）` : "（新版无对应条款，删除）"}`);
    lines.push("");
    lines.push("> " + (newSection?.content ?? "—").replace(/\n/g, "\n> "));
    lines.push("");
    lines.push(`**处理意见**：${note.comment || "（未填写）"}`);
    lines.push("");
    if (note.history.length > 0) {
      lines.push("<details><summary>处理记录（保留全部历史）</summary>");
      lines.push("");
      for (const entry of note.history) {
        lines.push(
          `- ${formatDate(entry.acted_at)} · ${entry.reviewer || "—"} · ${formatStatus(entry.status)}：${entry.comment || "（无意见）"}`
        );
      }
      lines.push("");
      lines.push("</details>");
      lines.push("");
    }
    lines.push("---");
    lines.push("");
  });

  logOperation("ReviewNote", "export", {
    count: context.notes.length,
    actor: context.actor ?? "本机用户"
  });

  return lines.join("\n");
}

/** 触发浏览器下载 Markdown 报告 */
export function downloadReviewReport(markdown: string): string {
  const filename = `审阅报告-${formatTimestampForFile()}.md`;
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return filename;
}
