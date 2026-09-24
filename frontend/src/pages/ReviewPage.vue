<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useReviewNoteStore } from "../stores/ReviewNoteStore";
import { useDiffResultStore } from "../stores/DiffResultStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import ReviewChecklist from "../components/common/ReviewChecklist.vue";
import { exportReviewReport, fetchReviewNotes, saveReviewNoteAction } from "../controllers/ReviewController";
import { ReviewStatusText } from "../constants/ReviewStatus";
import { toMessage } from "../utils/errors";
import type { ReviewStatus } from "../types/ReviewStatus";

const reviewStore = useReviewNoteStore();
const diffStore = useDiffResultStore();
const sectionStore = usePolicySectionStore();
const documentStore = usePolicyDocumentStore();

const inlineError = ref("");
const toast = ref("");
let toastTimer: ReturnType<typeof setTimeout> | undefined;

const showToast = (message: string) => {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ""), 3500);
};

const sectionsById = computed(
  () => new Map(sectionStore.rows.map((section) => [section.id, section]))
);

const reloadAll = async () => {
  await Promise.all([reviewStore.load(), diffStore.load(), sectionStore.load(), documentStore.load()]);
};

onMounted(reloadAll);

const onSave = async (draft: {
  id: number;
  diff_result_id: number;
  tag: string;
  comment: string;
  reviewer: string;
  status: ReviewStatus;
}) => {
  inlineError.value = "";
  try {
    const saved = await saveReviewNoteAction(
      { ...draft },
      { diffs: diffStore.rows, sectionsById: sectionsById.value }
    );
    reviewStore.upsertRow(saved);
    showToast(`已保存：${ReviewStatusText[saved.status]}（处理人：${saved.reviewer}）`);
  } catch (error) {
    // 已忽略未填原因 / 处理人为空：阻断保存，提示原因
    inlineError.value = toMessage(error);
    showToast(inlineError.value);
  }
};

const onExport = () => {
  inlineError.value = "";
  try {
    // 按当前状态筛选导出，报告含旧版、新版、差异摘要、状态、处理人、时间、意见
    const filterLabel =
      reviewStore.filter === "ALL"
        ? "全部状态"
        : ReviewStatusText[reviewStore.filter as ReviewStatus];
    const filename = exportReviewReport({
      notes: reviewStore.filteredRows,
      diffs: diffStore.rows,
      sectionsById: sectionsById.value,
      documents: documentStore.rows,
      filterLabel
    });
    showToast(`审阅报告已导出：${filename}`);
  } catch (error) {
    inlineError.value = toMessage(error);
  }
};

// 从其他页面修改条款退回备注时，重新聚焦本页也刷新一次
const onVisible = () => {
  if (document.visibilityState === "visible") void fetchReviewNotes().then((rows) => reviewStore.replaceRows(rows));
};
onMounted(() => document.addEventListener("visibilitychange", onVisible));
onUnmounted(() => document.removeEventListener("visibilitychange", onVisible));
</script>

<template>
  <section class="workbench wide">
    <div class="panel">
      <ReviewChecklist
        :notes="reviewStore.filteredRows"
        :all-notes="reviewStore.rows"
        :diffs="diffStore.rows"
        :sections-by-id="sectionsById"
        :loading="reviewStore.loading"
        :filter="reviewStore.filter"
        :inline-error="inlineError"
        @update:filter="reviewStore.setFilter"
        @save="onSave"
        @export="onExport"
      />
    </div>
    <div v-if="toast" class="toast">{{ toast }}</div>
  </section>
</template>
