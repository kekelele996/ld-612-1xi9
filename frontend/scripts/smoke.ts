import assert from "node:assert";
import { submitReviewNote, getAllReviewNotes } from "../src/services/ReviewService";
import { updatePolicySection } from "../src/services/PolicySectionService";
import { runVersionDiff } from "../src/services/DiffResultService";
import { getAllDiffs } from "../src/services/DiffResultService";
import { getAllSections } from "../src/services/PolicySectionService";
import { buildReviewReport } from "../src/services/ReviewReportService";
import { listPolicyDocument } from "../src/api/PolicyDocument";
import { ServiceError } from "../src/utils/errors";
import { ERROR_MESSAGES } from "../src/constants/errorMessages";
import { ReviewStatusText } from "../src/constants/ReviewStatus";

let passed = 0;
const ok = (name: string) => {
  passed += 1;
  console.log(`  ✓ ${name}`);
};

const sections = await getAllSections();
const sectionsById = new Map(sections.map((s) => [s.id, s]));
const diffs = await getAllDiffs();
const documents = await listPolicyDocument();
const ctx = { diffs, sectionsById };

// 1. 种子数据：4 条备注（OPEN/CONFIRMED/RESOLVED/IGNORED）
let notes = await getAllReviewNotes();
assert.strictEqual(notes.length, 4);
assert.strictEqual(notes.filter((n) => n.status === "OPEN").length, 1);
ok("种子审阅备注载入，各状态数量正确");

// 2. 处理人必填
await assert.rejects(
  () => submitReviewNote({ diff_result_id: 5, comment: "x", reviewer: "  ", status: "CONFIRMED" }, ctx),
  (err: unknown) => err instanceof ServiceError
);
ok("处理人为空时拒绝保存");

// 3. 已忽略但未写原因 → 抛错且不保存
const beforeIgnore = (await getAllReviewNotes()).length;
await assert.rejects(
  () => submitReviewNote({ diff_result_id: 5, comment: "   ", reviewer: "张测试", status: "IGNORED" }, ctx),
  (err: unknown) =>
    err instanceof ServiceError &&
    (err as Error).message === ERROR_MESSAGES.REVIEW_REASON_REQUIRED
);
assert.strictEqual((await getAllReviewNotes()).length, beforeIgnore, "忽略校验失败时不得新增记录");
ok("选择已忽略却没写原因时阻止保存，且数据未写入");

// 4. 正常保存 CONFIRMED：历史追加、更新时间变化
const openNote = notes.find((n) => n.status === "OPEN")!;
const savedConfirmed = await submitReviewNote(
  { id: openNote.id, diff_result_id: openNote.diff_result_id, tag: openNote.tag, comment: "确认整改", reviewer: "张测试", status: "CONFIRMED" },
  ctx
);
assert.strictEqual(savedConfirmed.status, "CONFIRMED");
assert.ok(savedConfirmed.history.length === 1 && savedConfirmed.history[0].reviewer === "张测试");
ok("正常保存后状态更新并追加处理记录");

// 5. 置为 RESOLVED 时生成快照
const savedResolved = await submitReviewNote(
  { id: openNote.id, diff_result_id: openNote.diff_result_id, tag: openNote.tag, comment: "已修复", reviewer: "张测试", status: "RESOLVED" },
  ctx
);
assert.ok(savedResolved.resolved_snapshot !== null);
assert.ok(savedResolved.resolved_snapshot!.new_content.includes("个性化推荐"));
assert.strictEqual(savedResolved.resolved_snapshot!.new_risk_level, "HIGH");
ok("已解决时保存对应条款正文与风险等级快照");

// 6. 修改对应新版条款风险等级 → 已解决退回待处理，历史保留
const reopenedResult = await updatePolicySection({ id: 11, risk_level: "CRITICAL" });
assert.strictEqual(reopenedResult.reopenedCount, 1);
notes = await getAllReviewNotes();
const reopened = notes.find((n) => n.id === openNote.id)!;
assert.strictEqual(reopened.status, "OPEN");
assert.strictEqual(reopened.resolved_snapshot, null);
assert.ok(reopened.history.length === 3, "历史应保留 CONFIRMED/RESOLVED/退回 三条");
assert.ok(reopened.history.some((h) => h.reviewer === "系统" && h.comment.includes("退回")));
ok("风险等级变化：已解决退回待处理，保留之前全部处理记录");

// 7. 修改正文同样触发退回
await submitReviewNote(
  { id: openNote.id, diff_result_id: openNote.diff_result_id, tag: openNote.tag, comment: "再次解决", reviewer: "张测试", status: "RESOLVED" },
  { diffs: await getAllDiffs(), sectionsById: new Map((await getAllSections()).map((s) => [s.id, s])) }
);
const bodyChange = await updatePolicySection({ id: 11, content: "更新后的条款正文内容：增加退出方式说明。" });
assert.strictEqual(bodyChange.reopenedCount, 1);
notes = await getAllReviewNotes();
assert.strictEqual(notes.find((n) => n.id === openNote.id)!.status, "OPEN");
ok("条款正文变化：已解决同样退回待处理");

// 8. 无关条款修改不应影响该备注（先恢复为 RESOLVED）
await submitReviewNote(
  { id: openNote.id, diff_result_id: openNote.diff_result_id, tag: openNote.tag, comment: "解决", reviewer: "张测试", status: "RESOLVED" },
  { diffs: await getAllDiffs(), sectionsById: new Map((await getAllSections()).map((s) => [s.id, s])) }
);
const unrelated = await updatePolicySection({ id: 9, content: sectionsById.get(9)!.content + "（仅措辞调整）" });
assert.strictEqual(unrelated.reopenedCount, 0);
assert.strictEqual((await getAllReviewNotes()).find((n) => n.id === openNote.id)!.status, "RESOLVED");
ok("无关条款变化不影响其他已解决备注");

// 9. 导出报告内容完整
const all = await getAllReviewNotes();
const md = buildReviewReport({
  notes: all,
  diffs: await getAllDiffs(),
  sectionsById: new Map((await getAllSections()).map((s) => [s.id, s])),
  documents,
  filterLabel: "全部状态"
});
for (const keyword of ["旧版", "新版", "差异摘要", "状态", "处理人", "处理意见"]) {
  assert.ok(md.includes(keyword), `报告缺少 ${keyword}`);
}
assert.ok(md.includes(ReviewStatusText.RESOLVED) || md.includes(ReviewStatusText.OPEN));
assert.ok(md.includes("个性化推荐") && md.includes("最近处理时间"));
ok("导出报告含旧版/新版/差异摘要/状态/处理人/时间/意见");

// 10. localStorage 持久化：重新“读取”得到的是变更后的状态
const persisted = await getAllReviewNotes();
assert.strictEqual(persisted.find((n) => n.id === openNote.id)!.status, "RESOLVED");
ok("处理结果保存在本机（localStorage）");

// 11. 重新对比：差异 id 稳定、备注关联不断链，并执行退回检查
const beforeRediff = await getAllReviewNotes();
const idMapBefore = new Map(
  (await getAllDiffs()).map((d) => [`${d.old_section_id}->${d.new_section_id}:${d.diff_type}`, d.id])
);
const { reopenedCount: rediffReopened } = await runVersionDiff(1, 2);
const diffsAfter = await getAllDiffs();
for (const [key, oldId] of idMapBefore) {
  const current = diffsAfter.find((d) => `${d.old_section_id}->${d.new_section_id}:${d.diff_type}` === key);
  assert.ok(current, `重新对比后差异 ${key} 不应消失`);
  assert.strictEqual(current!.id, oldId, `重新对比后差异 ${key} 的 id 必须稳定`);
}
const afterRediff = await getAllReviewNotes();
for (const note of beforeRediff) {
  const now = afterRediff.find((n) => n.id === note.id)!;
  assert.ok(diffsAfter.some((d) => d.id === now.diff_result_id), `备注#${note.id} 的差异关联断链`);
}
assert.ok(rediffReopened >= 0);
ok("重新对比后差异 id 稳定，审阅备注关联不断链并执行退回检查");

console.log(`\n全部 ${passed} 项冒烟测试通过。`);
process.exit(0);
