import type { PolicySection } from "../types/PolicySection";
import { createPolicySectionForm } from "../constructors/PolicySectionConstructor";

/**
 * 隐私政策文本自动分段：
 * 识别 “第一条 / 一、 / 1. / 1、 / # 标题” 等开头的条款块，
 * 并依据标题关键词给出默认类别与风险等级。
 */
const SECTION_HEAD =
  /^\s*(?:(?:第\s*[0-9一二三四五六七八九十百]+\s*条)|(?:[一二三四五六七八九十]+、)|(?:\d+[.、）)]\s*)|(?:#{1,4}\s+))/;

const CATEGORY_RULES: { match: RegExp; category: string; risk: PolicySection["risk_level"] }[] = [
  { match: /共享|转让|第三方|委托|SDK/i, category: "第三方共享", risk: "HIGH" },
  { match: /保存|存储|留存|期限|删除/i, category: "保存期限", risk: "MEDIUM" },
  { match: /未成年人|儿童|不满十四/, category: "未成年人", risk: "MEDIUM" },
  { match: /画像|推荐|自动化决策|定向/, category: "自动化决策", risk: "HIGH" },
  { match: /收集|获取|信息/, category: "数据收集", risk: "MEDIUM" },
  { match: /权利|访问|更正|注销|撤回/, category: "用户权利", risk: "LOW" }
];

export function usePolicyParser() {
  const parse = (rawText: string, documentId: number): PolicySection[] => {
    const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const blocks: { heading: string; body: string[] }[] = [];
    let current: { heading: string; body: string[] } | null = null;

    for (const line of lines) {
      if (SECTION_HEAD.test(line) || /我们如何|个人信息保护|您的权利/.test(line)) {
        current = { heading: line.replace(/^#{1,4}\s+/, ""), body: [] };
        blocks.push(current);
      } else if (current) {
        current.body.push(line);
      } else if (line.length > 0) {
        current = { heading: line, body: [] };
        blocks.push(current);
      }
    }

    const now = new Date().toISOString();
    return blocks.map((block, index) => {
      const rule = CATEGORY_RULES.find((item) => item.match.test(block.heading + block.body.join("")));
      const heading = block.heading
        .replace(SECTION_HEAD, "")
        .replace(/^[、.\s]+/, "")
        .trim();
      return createPolicySectionForm({
        document_id: documentId,
        section_no: String(index + 1),
        heading: heading || `条款 ${index + 1}`,
        content: block.body.join("\n") || block.heading,
        category: rule?.category ?? "其他",
        risk_level: rule?.risk ?? "LOW",
        updated_at: now
      });
    });
  };

  return { parse };
}
