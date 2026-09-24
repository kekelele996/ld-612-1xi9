<script setup lang="ts">
import { computed } from "vue";
import { formatReviewStatus } from "../../utils/formatters";

const props = defineProps<{ value: string }>();
const label = computed(() => formatReviewStatus(props.value));
const tone = computed(() => {
  switch (props.value) {
    case "OPEN":
      return "tone-open";
    case "CONFIRMED":
      return "tone-confirmed";
    case "IGNORED":
      return "tone-ignored";
    case "RESOLVED":
      return "tone-resolved";
    default:
      return "";
  }
});
</script>

<template>
  <span class="badge" :class="tone">{{ label }}</span>
</template>
