<script setup lang="ts">
import { computed } from "vue";
import { ReviewStatus } from "../../types/ReviewStatus";
import { ReviewStatusText } from "../../constants/ReviewStatus";

const props = defineProps<{ value: string }>();

const tone = computed(() =>
  (ReviewStatus as readonly string[]).includes(props.value) ? `status-${props.value.toLowerCase()}` : ""
);
const label = computed(
  () => ReviewStatusText[props.value as keyof typeof ReviewStatusText] ?? props.value.replace(/_/g, " ")
);
</script>

<template>
  <span class="badge" :class="tone">{{ label }}</span>
</template>
