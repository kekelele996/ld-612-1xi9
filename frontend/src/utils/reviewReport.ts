import { DiffTypeText } from "../constants/DiffType";
import { formatDate, formatReviewStatus, formatRisk } from "./formatters";
import type { ReviewStatus } from "../types/ReviewStatus";
import type { ReviewItemView } from "../types/ReviewItemView";

function versionLine(doc: ReviewItemView["oldDoc"], section: ReviewItemView["oldSection"]): string {
  if (!doc && !section) return "无对应条款";
  const docPart = doc ? `${doc.title}（${doc.version_label}）` : "未知文档";
  const sectionPart = section ? ` · ${section.section_no} ${section.heading}（风险等级：${formatRisk(section.risk_level)}）` : "";
  return docPart + sectionPart;
}

export function buildReviewReport(items: ReviewItemView[], generatedAt: Date = new Date()): string {
  const counts: Record<ReviewStatus, number> = { OPEN: 0, CONFIRMED: 0, IGNORED: 0, RESOLVED: 0 };
  for (const item of items) {
    if (item.note.status in counts) counts[item.note.status] += 1;
  }
  const lines: string[] = [
    "# 隐私政策差异审阅报告",
    "",
    `- 导出时间：${formatDate(generatedAt.toISOString())}`,
    `- 备注总数：${items.length}（待处理 ${counts.OPEN} / 已确认 ${counts.CONFIRMED} / 已忽略 ${counts.IGNORED} / 已解决 ${counts.RESOLVED}）`,
    ""
  ];
  items.forEach((item, index) => {
    const { note, diff } = item;
    lines.push(`## ${index + 1}. ${diff?.summary ?? note.tag}`);
    lines.push(`- 旧版：${versionLine(item.oldDoc, item.oldSection)}`);
    lines.push(`- 新版：${versionLine(item.newDoc, item.newSection)}`);
    lines.push(`- 差异类型：${diff ? DiffTypeText[diff.diff_type] : "-"}`);
    lines.push(`- 差异摘要：${diff?.summary ?? "-"}`);
    lines.push(`- 状态：${formatReviewStatus(note.status)}`);
    lines.push(`- 处理人：${note.reviewer || "未填写"}`);
    lines.push(`- 时间：${formatDate(note.updated_at)}`);
    lines.push(`- 意见：${note.comment || "无"}`);
    if (note.status === "IGNORED") lines.push(`- 忽略原因：${note.reason || "未填写"}`);
    lines.push("");
  });
  return lines.join("\n");
}

export function reportFilename(now: Date = new Date()): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `review-report-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}.md`;
}

export function downloadMarkdown(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
