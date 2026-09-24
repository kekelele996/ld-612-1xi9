<script setup lang="ts">
defineProps<{ title?: string; hint?: string }>();
</script>

<template>
  <div class="empty">
    <strong>{{ title ?? "暂无数据" }}</strong>
    <span v-if="hint">{{ hint }}</span>
  </div>
</template>
