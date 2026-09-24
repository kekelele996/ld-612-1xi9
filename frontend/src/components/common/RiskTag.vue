<script setup lang="ts">
import { computed } from "vue";
import { formatRisk } from "../../utils/formatters";

const props = defineProps<{ level: string }>();
const tone = computed(() => `risk-${props.level.toLowerCase()}`);
</script>

<template>
  <span class="risk-tag" :class="tone">{{ formatRisk(level) }}</span>
</template>
