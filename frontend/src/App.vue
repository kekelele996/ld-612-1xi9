<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { navRoutes as routes } from "./router/routes";
import StatusBadge from "./components/common/StatusBadge.vue";
import StatCard from "./components/common/StatCard.vue";
import { useReviewNoteStore } from "./stores/ReviewNoteStore";
import { usePolicyDocumentStore } from "./stores/PolicyDocumentStore";

const route = useRoute();
const reviewStore = useReviewNoteStore();
const documentStore = usePolicyDocumentStore();
const currentName = computed(() => (route.name as string | undefined) ?? "审阅清单");
const openCount = computed(() => reviewStore.counts.OPEN);

void documentStore.load();
void reviewStore.load();
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">隐私政策差异对比器</div>
      <nav>
        <RouterLink v-for="item in routes" :key="item.path" :to="item.path" custom v-slot="{ navigate, isActive }">
          <button :class="{ active: isActive }" @click="navigate">{{ item.name }}</button>
        </RouterLink>
      </nav>
    </aside>
    <main class="page">
      <section class="page-head">
        <div>
          <p class="eyebrow">policy-diff</p>
          <h1>{{ currentName }}</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <section class="metrics">
        <StatCard label="政策版本" :value="documentStore.rows.length" />
        <StatCard label="待处理备注" :value="openCount" />
        <StatCard label="审阅备注总数" :value="reviewStore.total" />
      </section>
      <RouterView />
    </main>
  </div>
</template>
