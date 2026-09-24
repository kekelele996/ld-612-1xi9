<script setup lang="ts">
import { onMounted, ref } from "vue";
import ImportPanel from "../components/common/ImportPanel.vue";
import SectionCard from "../components/common/SectionCard.vue";
import EmptyState from "../components/common/EmptyState.vue";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { importPolicyDocument } from "../services/PolicyDocumentService";
import { usePolicyParser } from "../hooks/usePolicyParser";
import { formatDate } from "../utils/formatters";

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();
const expanded = ref<number | null>(null);
const toast = ref("");

onMounted(async () => {
  await Promise.all([documentStore.load(), sectionStore.load()]);
});

const onImport = async (payload: { title: string; version_label: string; raw_text: string }) => {
  const { parse } = usePolicyParser();
  // id 先给 0，service 落库时替换为本机新 id
  const parsed = parse(payload.raw_text, 0);
  const { document } = await importPolicyDocument(payload, parsed);
  await Promise.all([documentStore.load(), sectionStore.load()]);
  expanded.value = document.id;
  toast.value = `已导入 ${document.version_label}，自动分段 ${parsed.length} 个条款，数据保存在本机。`;
  setTimeout(() => (toast.value = ""), 3500);
};

const sectionsOf = (documentId: number) =>
  sectionStore.rows.filter((section) => section.document_id === documentId);
</script>

<template>
  <section class="page-stack">
    <ImportPanel @import="onImport" />

    <div class="panel">
      <h2>版本列表（{{ documentStore.rows.length }}）</h2>
      <EmptyState v-if="documentStore.rows.length === 0" title="还没有导入任何版本" />
      <article v-for="doc in documentStore.rows" :key="doc.id" class="doc-block">
        <header class="doc-head" @click="expanded = expanded === doc.id ? null : doc.id">
          <div>
            <strong>{{ doc.title }}</strong>
            <span class="doc-version">{{ doc.version_label }}</span>
          </div>
          <div class="doc-meta">
            <span>导入时间：{{ formatDate(doc.imported_at) }}</span>
            <span class="doc-count">{{ sectionsOf(doc.id).length }} 个条款</span>
            <button type="button" class="link-btn">{{ expanded === doc.id ? "收起" : "展开条款" }}</button>
          </div>
        </header>
        <div v-if="expanded === doc.id" class="doc-sections">
          <SectionCard
            v-for="section in sectionsOf(doc.id)"
            :key="section.id"
            :section="section"
            compact
          />
        </div>
      </article>
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </section>
</template>
