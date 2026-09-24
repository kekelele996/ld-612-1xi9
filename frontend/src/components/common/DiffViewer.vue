<script setup lang="ts">
import { computed } from "vue";
import type { DiffResult } from "../../types/DiffResult";
import type { PolicySection } from "../../types/PolicySection";
import { DiffTypeText } from "../../constants/DiffType";
import RiskTag from "./RiskTag.vue";

const props = defineProps<{
  diff: DiffResult;
  oldSection?: PolicySection;
  newSection?: PolicySection;
  expanded?: boolean;
}>();

const diffLabel = computed(() => DiffTypeText[props.diff.diff_type] ?? props.diff.diff_type);
</script>

<template>
  <article class="diff-viewer" :class="`diff-${diff.diff_type.toLowerCase()}`">
    <header class="diff-head">
      <span class="diff-type">{{ diffLabel }}</span>
      <strong>{{ newSection?.heading ?? oldSection?.heading ?? "条款" }}</strong>
    </header>
    <p class="diff-summary">{{ diff.summary }}</p>
    <div v-if="expanded !== false" class="diff-columns">
      <div class="diff-col">
        <h4>旧版 <RiskTag v-if="oldSection" :value="oldSection.risk_level" /></h4>
        <p>{{ oldSection?.content ?? "（旧版无对应条款，本条为新增）" }}</p>
      </div>
      <div class="diff-arrow">→</div>
      <div class="diff-col">
        <h4>新版 <RiskTag v-if="newSection" :value="newSection.risk_level" /></h4>
        <p>{{ newSection?.content ?? "（新版无对应条款，本条为删除）" }}</p>
      </div>
    </div>
  </article>
</template>
