<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import RiskTag from "../components/common/RiskTag.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { saveSectionAction } from "../controllers/RiskController";
import { PRIVACY_RISK_LEVEL_OPTIONS } from "../constants/PrivacyRiskLevel";
import type { PrivacyRiskLevel } from "../types/PrivacyRiskLevel";
import type { PolicySection } from "../types/PolicySection";

const sectionStore = usePolicySectionStore();
const documentStore = usePolicyDocumentStore();
const docFilter = ref<number | "ALL">("ALL");
const toast = ref("");
const editingId = ref<number | null>(null);
const drafts = reactive<Record<number, { content: string; risk_level: PrivacyRiskLevel }>>({});

onMounted(async () => {
  await Promise.all([sectionStore.load(), documentStore.load()]);
});

const visibleSections = (): PolicySection[] =>
  docFilter.value === "ALL"
    ? sectionStore.rows
    : sectionStore.rows.filter((section) => section.document_id === docFilter.value);

const docLabel = (id: number) => {
  const doc = documentStore.rows.find((item) => item.id === id);
  return doc ? doc.version_label : `文档#${id}`;
};

const startEdit = (section: PolicySection) => {
  editingId.value = section.id;
  drafts[section.id] = { content: section.content, risk_level: section.risk_level };
};

const onSave = async (section: PolicySection) => {
  const draft = drafts[section.id];
  if (!draft) return;
  const { section: saved, reopenedCount } = await saveSectionAction({
    id: section.id,
    content: draft.content,
    risk_level: draft.risk_level
  });
  sectionStore.upsertRow(saved);
  editingId.value = null;
  toast.value =
    reopenedCount > 0
      ? `条款已保存，${reopenedCount} 条“已解决”备注因正文或风险等级变化已退回“待处理”，历史记录已保留。`
      : "条款已保存到本机。";
  setTimeout(() => (toast.value = ""), 4000);
};

const riskCounts = () => {
  const counts: Record<string, number> = {};
  for (const section of visibleSections())
    counts[section.risk_level] = (counts[section.risk_level] ?? 0) + 1;
  return counts;
};
</script>

<template>
  <section class="page-stack">
    <div class="panel">
      <h2>风险标注</h2>
      <div class="risk-toolbar">
        <label>
          版本
          <select v-model="docFilter">
            <option value="ALL">全部版本</option>
            <option v-for="doc in documentStore.rows" :key="doc.id" :value="doc.id">
              {{ doc.version_label }}
            </option>
          </select>
        </label>
        <div class="risk-legend">
          <RiskTag v-for="option in PRIVACY_RISK_LEVEL_OPTIONS" :key="option.value" :value="option.value" />
          <span class="muted">共 {{ visibleSections().length }} 个条款</span>
        </div>
      </div>
      <p class="muted">风险分布：{{ riskCounts() }}</p>
    </div>

    <div class="panel">
      <EmptyState v-if="visibleSections().length === 0" title="暂无条款，请先在文档导入页粘贴政策文本" />
      <article v-for="section in visibleSections()" :key="section.id" class="risk-item">
        <header class="risk-item-head">
          <div>
            <span class="section-no">{{ section.section_no }}</span>
            <strong>{{ section.heading }}</strong>
            <span class="muted">[{{ section.category }}]</span>
            <span class="doc-chip">{{ docLabel(section.document_id) }}</span>
          </div>
          <RiskTag :value="section.risk_level" />
        </header>

        <template v-if="editingId === section.id">
          <label class="risk-edit-label">
            风险等级
            <select v-model="drafts[section.id].risk_level">
              <option v-for="option in PRIVACY_RISK_LEVEL_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
          <textarea v-model="drafts[section.id].content" rows="4"></textarea>
          <div class="form-actions">
            <button type="button" class="btn" @click="editingId = null">取消</button>
            <button type="button" class="btn primary" @click="onSave(section)">保存条款</button>
          </div>
          <p class="muted hint">保存后若正文或风险等级发生变化，相关“已解决”审阅备注会自动退回“待处理”。</p>
        </template>
        <template v-else>
          <p class="section-content">{{ section.content }}</p>
          <button type="button" class="link-btn" @click="startEdit(section)">编辑正文 / 风险等级</button>
        </template>
      </article>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </section>
</template>
