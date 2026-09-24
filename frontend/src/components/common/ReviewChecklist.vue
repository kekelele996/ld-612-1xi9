<script setup lang="ts">
import { computed, reactive, watch } from "vue";
import type { ReviewNote } from "../../types/ReviewNote";
import type { ReviewStatus } from "../../types/ReviewStatus";
import type { DiffResult } from "../../types/DiffResult";
import type { PolicySection } from "../../types/PolicySection";
import { ReviewStatus as ReviewStatuses, ReviewStatusText, REVIEW_STATUS_FILTERS } from "../../constants/ReviewStatus";
import { formatDate, formatDiffType } from "../../utils/formatters";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import StatusBadge from "./StatusBadge.vue";
import RiskTag from "./RiskTag.vue";
import EmptyState from "./EmptyState.vue";

const props = defineProps<{
  notes: ReviewNote[];
  allNotes: ReviewNote[];
  diffs: DiffResult[];
  sectionsById: Map<number, PolicySection>;
  loading?: boolean;
  filter: ReviewStatus | "ALL";
  inlineError?: string;
}>();

const emit = defineEmits<{
  (e: "update:filter", value: ReviewStatus | "ALL"): void;
  (e: "save", draft: { id: number; diff_result_id: number; tag: string; comment: string; reviewer: string; status: ReviewStatus }): void;
  (e: "export"): void;
}>();

type FilterValue = ReviewStatus | "ALL";

const tabs = computed(() => [
  { value: "ALL" as FilterValue, label: "全部", count: props.allNotes.length },
  ...REVIEW_STATUS_FILTERS.map((item) => ({
    value: item.value as FilterValue,
    label: item.label,
    count: props.allNotes.filter((note) => note.status === item.value).length
  }))
]);

const drafts = reactive<Record<number, { reviewer: string; comment: string; status: ReviewStatus; tag: string }>>({});
const localErrors = reactive<Record<number, string>>({});
const openHistory = reactive<Record<number, boolean>>({});
/** 记录每条备注上次同步到草稿的 updated_at，用于识别外部变更（如系统退回待处理） */
const syncedAt: Record<number, string> = {};

const syncDraft = (note: ReviewNote) => {
  if (!drafts[note.id] || syncedAt[note.id] !== note.updated_at) {
    drafts[note.id] = {
      reviewer: note.reviewer,
      comment: note.comment,
      status: note.status,
      tag: note.tag
    };
    syncedAt[note.id] = note.updated_at;
  }
};

watch(
  () => props.notes,
  (notes) => notes.forEach(syncDraft),
  { immediate: true, deep: true }
);

const diffOf = (note: ReviewNote) => props.diffs.find((diff) => diff.id === note.diff_result_id);
const section = (id: number | null | undefined) => (id != null ? props.sectionsById.get(id) : undefined);

const statusOptions = ReviewStatuses.map((value) => ({ value, label: ReviewStatusText[value] }));

const onSave = (note: ReviewNote) => {
  const draft = drafts[note.id];
  localErrors[note.id] = "";
  if (!draft.reviewer.trim()) {
    localErrors[note.id] = ERROR_MESSAGES.REVIEW_REVIEWER_REQUIRED;
    return;
  }
  // 规则：选择“已忽略”却没写原因时不要保存（本地先拦一道，service 层还有同样校验）
  if (draft.status === "IGNORED" && !draft.comment.trim()) {
    localErrors[note.id] = ERROR_MESSAGES.REVIEW_REASON_REQUIRED;
    return;
  }
  emit("save", {
    id: note.id,
    diff_result_id: note.diff_result_id,
    tag: draft.tag,
    comment: draft.comment,
    reviewer: draft.reviewer,
    status: draft.status
  });
};

const isReopenEntry = (text: string) => text.includes("退回");
</script>

<template>
  <div class="review-checklist">
    <div class="review-toolbar">
      <div class="filter-tabs" role="tablist">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="filter-tab"
          :class="{ active: filter === tab.value }"
          @click="emit('update:filter', tab.value)"
        >
          {{ tab.label }}<span class="tab-count">{{ tab.count }}</span>
        </button>
      </div>
      <button type="button" class="btn primary" @click="emit('export')">导出审阅报告（Markdown）</button>
    </div>

    <p v-if="inlineError" class="form-error global-error">{{ inlineError }}</p>

    <div v-if="loading" class="loading-hint">正在读取本机审阅数据…</div>

    <EmptyState
      v-else-if="notes.length === 0"
      title="该状态下暂无备注"
      hint="切换其他状态页签查看，或在版本对比后生成新的差异备注。"
    />

    <article v-for="note in notes" :key="note.id" class="review-item">
      <header class="review-item-head">
        <div>
          <span class="diff-type-chip">{{ formatDiffType(diffOf(note)?.diff_type ?? "") }}</span>
          <strong>{{ note.tag || "未命名差异" }}</strong>
        </div>
        <StatusBadge :value="note.status" />
      </header>

      <p class="diff-summary">{{ diffOf(note)?.summary ?? "差异数据缺失" }}</p>

      <div class="diff-columns compact">
        <div class="diff-col">
          <h4>旧版
            <RiskTag v-if="section(diffOf(note)?.old_section_id)" :value="section(diffOf(note)?.old_section_id)?.risk_level ?? ''" />
          </h4>
          <p>{{ section(diffOf(note)?.old_section_id)?.content ?? "（旧版无对应条款，新增）" }}</p>
        </div>
        <div class="diff-arrow">→</div>
        <div class="diff-col">
          <h4>新版
            <RiskTag v-if="section(diffOf(note)?.new_section_id)" :value="section(diffOf(note)?.new_section_id)?.risk_level ?? ''" />
          </h4>
          <p>{{ section(diffOf(note)?.new_section_id)?.content ?? "（新版无对应条款，删除）" }}</p>
        </div>
      </div>

      <div class="review-meta">
        <span>最近处理：{{ note.reviewer || "未分配" }} · {{ formatDate(note.updated_at) }}</span>
        <button
          v-if="note.history.length > 0"
          type="button"
          class="link-btn"
          @click="openHistory[note.id] = !openHistory[note.id]"
        >
          处理记录（{{ note.history.length }}）{{ openHistory[note.id] ? "收起" : "展开" }}
        </button>
      </div>

      <ul v-if="openHistory[note.id]" class="history-list">
        <li
          v-for="(entry, i) in note.history"
          :key="i"
          :class="{ reopen: isReopenEntry(entry.comment) }"
        >
          <span class="history-time">{{ formatDate(entry.acted_at) }}</span>
          <StatusBadge :value="entry.status" />
          <span class="history-reviewer">{{ entry.reviewer || "—" }}</span>
          <span class="history-comment">{{ entry.comment || "（无意见）" }}</span>
        </li>
      </ul>

      <div class="review-form">
        <label>
          处理人
          <input v-model="drafts[note.id].reviewer" type="text" placeholder="请输入处理人姓名" />
        </label>
        <label>
          状态
          <select v-model="drafts[note.id].status">
            <option v-for="option in statusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>
        <label class="full">
          处理意见<span v-if="drafts[note.id].status === 'IGNORED'" class="required-hint">（已忽略必须填写原因）</span>
          <textarea v-model="drafts[note.id].comment" rows="3" placeholder="填写处理意见 / 忽略原因 / 解决说明"></textarea>
        </label>
        <p v-if="localErrors[note.id]" class="form-error">{{ localErrors[note.id] }}</p>
        <div class="form-actions">
          <button type="button" class="btn primary" @click="onSave(note)">保存处理意见</button>
        </div>
      </div>
    </article>
  </div>
</template>
