<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { routes } from "./router/routes";
import StatusBadge from "./components/common/StatusBadge.vue";

const route = useRoute();
const router = useRouter();
const current = computed(() => routes.find((item) => item.route === route.path));
</script>

<template>
  <div class="shell">
    <aside>
      <div class="brand">隐私政策差异对比器</div>
      <nav>
        <button
          v-for="item in routes"
          :key="item.route"
          type="button"
          :class="{ active: route.path === item.route }"
          @click="router.push(item.route)"
        >
          {{ item.name }}
        </button>
      </nav>
    </aside>
    <main class="page">
      <section class="page-head">
        <div>
          <p class="eyebrow">policy-diff</p>
          <h1>{{ current?.name ?? "" }}</h1>
        </div>
        <StatusBadge value="LOCAL_DATA" />
      </section>
      <RouterView />
    </main>
  </div>
</template>
