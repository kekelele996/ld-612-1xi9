<script setup lang="ts">defineProps<{ message?: string }>();</script>
<template><div class="empty">{{ message ?? "暂无数据" }}</div></template>
