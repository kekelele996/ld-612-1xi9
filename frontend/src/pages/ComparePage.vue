<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import DiffViewer from "../components/common/DiffViewer.vue";
import EmptyState from "../components/common/EmptyState.vue";
import StatCard from "../components/common/StatCard.vue";
import { usePolicyDocumentStore } from "../stores/PolicyDocumentStore";
import { usePolicySectionStore } from "../stores/PolicySectionStore";
import { useDiffResultStore } from "../stores/DiffResultStore";
import { runVersionDiff } from "../services/DiffResultService";
import { DIFF_TYPE_FILTERS } from "../constants/DiffType";

const documentStore = usePolicyDocumentStore();
const sectionStore = usePolicySectionStore();
const diffStore = useDiffResultStore();

const oldId = ref<number | null>(null);
const newId = ref<number | null>(null);
const toast = ref("");

onMounted(async () => {
  await Promise.all([documentStore.load(), sectionStore.load(), diffStore.load()]);
  const sorted = [...documentStore.rows].sort((a, b) => a.imported_at.localeCompare(b.imported_at));
  oldId.value = sorted[0]?.id ?? null;
  newId.value = sorted[sorted.length - 1]?.id ?? null;
});

const sectionsById = computed(
  () => new Map(sectionStore.rows.map((section) => [section.id, section]))
);

const oldDoc = computed(() => documentStore.rows.find((doc) => doc.id === oldId.value));
const newDoc = computed(() => documentStore.rows.find((doc) => doc.id === newId.value));

const onCompare = async () => {
  if (oldId.value == null || newId.value == null) return;
  const { reopenedCount } = await runVersionDiff(oldId.value, newId.value);
  await diffStore.load();
  toast.value =
    reopenedCount > 0
      ? `对比完成：${diffStore.rows.length} 条差异；检测到条款变化，${reopenedCount} 条已解决备注已退回待处理。`
      : `对比完成：共 ${diffStore.rows.length} 条差异。`;
  setTimeout(() => (toast.value = ""), 4000);
};

const typeCounts = computed(() => {
  const map: Record<string, number> = {};
  for (const diff of diffStore.rows) map[diff.diff_type] = (map[diff.diff_type] ?? 0) + 1;
  return map;
});
</script>

<template>
  <section class="page-stack">
    <div class="panel">
      <h2>选择对比版本</h2>
      <div class="compare-pickers">
        <label>
          旧版
          <select v-model="oldId">
            <option v-for="doc in documentStore.rows" :key="doc.id" :value="doc.id">
              {{ doc.title }} {{ doc.version_label }}
            </option>
          </select>
        </label>
        <label>
          新版
          <select v-model="newId">
            <option v-for="doc in documentStore.rows" :key="doc.id" :value="doc.id">
              {{ doc.title }} {{ doc.version_label }}
            </option>
          </select>
        </label>
        <button type="button" class="btn primary" :disabled="oldId === newId" @click="onCompare">重新对比</button>
      </div>
    </div>

    <section class="metrics metrics-4">
      <StatCard label="旧版条款" :value="oldDoc ? sectionStore.rows.filter((s) => s.document_id === oldDoc?.id).length : 0" />
      <StatCard label="新版条款" :value="newDoc ? sectionStore.rows.filter((s) => s.document_id === newDoc?.id).length : 0" />
      <StatCard label="差异总数" :value="diffStore.rows.length" />
      <StatCard label="修改类差异" :value="typeCounts.MODIFIED ?? 0" />
    </section>

    <div class="panel">
      <h2>差异列表</h2>
      <div class="filter-tabs">
        <button
          type="button"
          class="filter-tab"
          :class="{ active: diffStore.typeFilter === 'ALL' }"
          @click="diffStore.setTypeFilter('ALL')"
        >
          全部<span class="tab-count">{{ diffStore.rows.length }}</span>
        </button>
        <button
          v-for="item in DIFF_TYPE_FILTERS"
          :key="item.value"
          type="button"
          class="filter-tab"
          :class="{ active: diffStore.typeFilter === item.value }"
          @click="diffStore.setTypeFilter(item.value)"
        >
          {{ item.label }}<span class="tab-count">{{ typeCounts[item.value] ?? 0 }}</span>
        </button>
      </div>

      <EmptyState v-if="diffStore.filteredRows.length === 0" title="当前筛选下没有差异" />
      <DiffViewer
        v-for="diff in diffStore.filteredRows"
        :key="diff.id"
        :diff="diff"
        :old-section="diff.old_section_id != null ? sectionsById.get(diff.old_section_id) : undefined"
        :new-section="diff.new_section_id != null ? sectionsById.get(diff.new_section_id) : undefined"
      />
    </div>

    <div v-if="toast" class="toast">{{ toast }}</div>
  </section>
</template>
