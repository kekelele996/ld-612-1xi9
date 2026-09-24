<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useReviewNoteStore } from "../stores/ReviewNoteStore";
import { useDiffResultStore } from "../stores/DiffResultStore";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { ReviewStatusFilterOptions } from "../constants/ReviewStatus";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import { useLocalStorageState } from "../hooks/useLocalStorageState";
import { buildReviewReport, downloadMarkdown, reportFilename } from "../utils/reviewReport";
import ReviewChecklist from "../components/common/ReviewChecklist.vue";
import EmptyState from "../components/common/EmptyState.vue";
import type { ReviewItemView } from "../types/ReviewItemView";
import type { ReviewNote } from "../types/ReviewNote";
import type { PolicySection } from "../types/PolicySection";

const noteStore = useReviewNoteStore();
const diffStore = useDiffResultStore();
const docStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();

const notice = ref("");
let noticeTimer: number | undefined;
function showNotice(message: string) {
  notice.value = message;
  window.clearTimeout(noticeTimer);
  noticeTimer = window.setTimeout(() => {
    notice.value = "";
  }, 3000);
}

onMounted(async () => {
  await Promise.all([noteStore.load(), diffStore.load(), docStore.load(), sectionStore.load()]);
  const reverted = noteStore.reconcileResolvedNotes(sectionStore.rows);
  if (reverted > 0) showNotice(`${reverted} 条已解决备注因条款变化退回待处理`);
});

function toView(note: ReviewNote): ReviewItemView {
  const diff = diffStore.rows.find((item) => item.id === note.diff_result_id);
  const anchor = diff ? sectionStore.rows.find((item) => item.id === diff.section_id) : undefined;
  const newSection =
    diff && anchor ? sectionStore.rows.find((item) => item.document_id === diff.new_document_id && item.section_no === anchor.section_no) : undefined;
  const oldSection =
    diff && anchor ? sectionStore.rows.find((item) => item.document_id === diff.old_document_id && item.section_no === anchor.section_no) : undefined;
  const oldDoc = diff ? docStore.rows.find((item) => item.id === diff.old_document_id) : undefined;
  const newDoc = diff ? docStore.rows.find((item) => item.id === diff.new_document_id) : undefined;
  return { note, diff, oldDoc, newDoc, oldSection, newSection };
}

const items = computed(() => noteStore.filteredRows.map(toView));
const allItems = computed(() => noteStore.rows.map(toView));

const lastReviewer = useLocalStorageState("last-reviewer", "");

async function onSave(draft: ReviewNote) {
  const ok = await noteStore.save(draft);
  if (ok) {
    if (draft.reviewer) lastReviewer.value = draft.reviewer;
    showNotice("已保存到本机");
  }
}

async function onSectionUpdate(section: PolicySection) {
  const reverted = await sectionStore.updateSection(section);
  showNotice(reverted > 0 ? `条款已更新，${reverted} 条已解决备注退回待处理` : "条款已更新");
}

function onExport() {
  downloadMarkdown(reportFilename(), buildReviewReport(allItems.value));
  console.info(LOG_TEMPLATES.ReviewNote.export);
  showNotice("审阅报告已导出");
}
</script>

<template>
  <section class="review-page">
    <div class="filter-bar">
      <button
        v-for="option in ReviewStatusFilterOptions"
        :key="option.value"
        type="button"
        class="filter-btn"
        :class="{ active: noteStore.filter === option.value }"
        @click="noteStore.setFilter(option.value)"
      >
        {{ option.label }}（{{ noteStore.counts[option.value] }}）
      </button>
      <button type="button" class="export-btn" @click="onExport">导出审阅报告</button>
    </div>
    <p class="notice" v-if="notice">{{ notice }}</p>
    <p class="error-banner" v-if="noteStore.error">{{ noteStore.error }}</p>
    <EmptyState v-if="!noteStore.loading && items.length === 0" message="当前筛选下没有审阅备注" />
    <ReviewChecklist :items="items" :default-reviewer="lastReviewer" @save="onSave" @section-update="onSectionUpdate" />
  </section>
</template>
