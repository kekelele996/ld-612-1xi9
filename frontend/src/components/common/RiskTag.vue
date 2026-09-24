<script setup lang="ts">
import { computed } from "vue";
import { formatRisk } from "../../utils/formatters";
import type { PrivacyRiskLevel } from "../../types/PrivacyRiskLevel";

const props = defineProps<{ value: string }>();
const tone = computed(() => `risk-${(props.value as PrivacyRiskLevel).toLowerCase()}`);
</script>

<template>
  <span class="risk-tag" :class="tone">{{ formatRisk(value) }}</span>
</template>
