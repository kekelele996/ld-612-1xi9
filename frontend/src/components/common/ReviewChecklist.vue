<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { ReviewStatus, ReviewStatusLabel } from "../../constants/ReviewStatus";
import { PrivacyRiskLevel } from "../../constants/PrivacyRiskLevel";
import { DiffTypeText } from "../../constants/DiffType";
import { ERROR_MESSAGES } from "../../constants/errorMessages";
import { LOG_TEMPLATES } from "../../constants/logTemplates";
import { createReviewNoteForm } from "../../constructors/ReviewNoteConstructor";
import { formatDate, formatReviewStatus, formatRisk } from "../../utils/formatters";
import type { ReviewItemView } from "../../types/ReviewItemView";
import type { ReviewNote } from "../../types/ReviewNote";
import type { PolicySection } from "../../types/PolicySection";
import StatusBadge from "./StatusBadge.vue";
import RiskTag from "./RiskTag.vue";
import DiffViewer from "./DiffViewer.vue";

const props = defineProps<{ items: ReviewItemView[]; defaultReviewer?: string }>();
const emit = defineEmits<{
  (e: "save", draft: ReviewNote): void;
  (e: "sectionUpdate", section: PolicySection): void;
}>();

interface Draft {
  stamp: string;
  reviewer: string;
  status: ReviewNote["status"];
  comment: string;
  reason: string;
  error: string;
}

const drafts = reactive<Record<number, Draft>>({});

function ensureDraft(item: ReviewItemView): Draft {
  const existing = drafts[item.note.id];
  if (existing && existing.stamp === item.note.updated_at) return existing;
  drafts[item.note.id] = {
    stamp: item.note.updated_at,
    reviewer: item.note.reviewer || props.defaultReviewer || "",
    status: item.note.status,
    comment: item.note.comment,
    reason: item.note.reason,
    error: ""
  };
  return drafts[item.note.id];
}

watch(
  () => props.items,
  (items) => {
    for (const item of items) ensureDraft(item);
  },
  { immediate: true, deep: true }
);

function versionLabel(item: ReviewItemView, side: "old" | "new"): string {
  const doc = side === "old" ? item.oldDoc : item.newDoc;
  const section = side === "old" ? item.oldSection : item.newSection;
  const docPart = doc ? `${doc.title} ${doc.version_label}` : side === "old" ? "旧版" : "新版";
  return section ? `${docPart} · ${section.section_no} ${section.heading}` : docPart;
}

function submit(item: ReviewItemView) {
  const draft = ensureDraft(item);
  if (draft.status === "IGNORED" && !draft.reason.trim()) {
    draft.error = ERROR_MESSAGES.REVIEW_REASON_REQUIRED;
    console.warn(LOG_TEMPLATES.ReviewNote.invalid, item.note.id);
    return;
  }
  draft.error = "";
  const now = new Date().toISOString();
  const resolved = draft.status === "RESOLVED";
  const payload = createReviewNoteForm({
    ...item.note,
    reviewer: draft.reviewer.trim(),
    status: draft.status,
    comment: draft.comment.trim(),
    reason: draft.reason.trim(),
    resolved_section_id: resolved ? item.newSection?.id ?? null : item.note.resolved_section_id,
    resolved_section_content: resolved ? item.newSection?.content ?? "" : item.note.resolved_section_content,
    resolved_risk_level: resolved ? item.newSection?.risk_level ?? "" : item.note.resolved_risk_level,
    updated_at: now,
    history: [
      ...item.note.history,
      {
        status: draft.status,
        reviewer: draft.reviewer.trim(),
        comment: draft.comment.trim(),
        reason: draft.reason.trim(),
        changed_at: now
      }
    ]
  });
  emit("save", payload);
}

const editingSectionId = ref<number | null>(null);
const sectionDraft = reactive({ content: "", risk_level: "" });

function startEditSection(item: ReviewItemView) {
  if (!item.newSection) return;
  editingSectionId.value = item.newSection.id;
  sectionDraft.content = item.newSection.content;
  sectionDraft.risk_level = item.newSection.risk_level;
}

function submitSection(item: ReviewItemView) {
  if (!item.newSection) return;
  emit("sectionUpdate", {
    ...item.newSection,
    content: sectionDraft.content.trim(),
    risk_level: sectionDraft.risk_level as PolicySection["risk_level"]
  });
  editingSectionId.value = null;
}
</script>

<template>
  <div class="review-list">
    <article class="review-item" v-for="item in items" :key="item.note.id">
      <header class="review-item-head">
        <div>
          <strong>{{ item.diff?.summary ?? item.note.tag }}</strong>
          <div class="review-item-meta">
            <span class="chip" v-if="item.diff">{{ DiffTypeText[item.diff.diff_type] }}</span>
            <span class="chip">{{ item.note.tag }}</span>
            <RiskTag v-if="item.newSection" :level="item.newSection.risk_level" />
          </div>
        </div>
        <StatusBadge :value="item.note.status" />
      </header>

      <DiffViewer
        :old-label="versionLabel(item, 'old')"
        :new-label="versionLabel(item, 'new')"
        :old-text="item.oldSection?.content ?? ''"
        :new-text="item.newSection?.content ?? ''"
      />

      <div class="section-adjust" v-if="item.newSection">
        <button v-if="editingSectionId !== item.newSection.id" class="link-btn" type="button" @click="startEditSection(item)">
          调整条款正文 / 风险等级
        </button>
        <div v-else class="section-editor">
          <label>
            条款正文
            <textarea v-model="sectionDraft.content" rows="3"></textarea>
          </label>
          <label>
            风险等级
            <select v-model="sectionDraft.risk_level">
              <option v-for="level in PrivacyRiskLevel" :key="level" :value="level">{{ formatRisk(level) }}</option>
            </select>
          </label>
          <div class="editor-actions">
            <button class="primary-btn" type="button" @click="submitSection(item)">保存条款</button>
            <button class="link-btn" type="button" @click="editingSectionId = null">取消</button>
          </div>
        </div>
      </div>

      <div class="review-form">
        <label>
          处理人
          <input v-model="ensureDraft(item).reviewer" type="text" placeholder="填写处理人" />
        </label>
        <label>
          处理状态
          <select v-model="ensureDraft(item).status">
            <option v-for="status in ReviewStatus" :key="status" :value="status">{{ ReviewStatusLabel[status] }}</option>
          </select>
        </label>
        <label class="wide">
          处理意见
          <textarea v-model="ensureDraft(item).comment" rows="2" placeholder="填写处理意见，便于交接"></textarea>
        </label>
        <label class="wide" v-if="ensureDraft(item).status === 'IGNORED'">
          忽略原因（必填）
          <textarea v-model="ensureDraft(item).reason" rows="2" placeholder="选择已忽略时必须填写原因"></textarea>
        </label>
        <p class="form-error" v-if="ensureDraft(item).error">{{ ensureDraft(item).error }}</p>
        <div class="form-actions">
          <button class="primary-btn" type="button" @click="submit(item)">保存处理结果</button>
          <span class="updated">最近更新：{{ formatDate(item.note.updated_at) }}</span>
        </div>
      </div>

      <details class="history" v-if="item.note.history.length">
        <summary>处理记录（{{ item.note.history.length }}）</summary>
        <ul>
          <li v-for="(entry, index) in [...item.note.history].reverse()" :key="index">
            <span>{{ formatDate(entry.changed_at) }}</span>
            <span>{{ formatReviewStatus(entry.status) }}</span>
            <span>{{ entry.reviewer || "未填写" }}</span>
            <span>{{ entry.comment || "—" }}</span>
            <span v-if="entry.reason">原因：{{ entry.reason }}</span>
          </li>
        </ul>
      </details>
    </article>
  </div>
</template>
