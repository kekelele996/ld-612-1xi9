<script setup lang="ts">
import type { PolicySection } from "../../types/PolicySection";
import RiskTag from "./RiskTag.vue";

defineProps<{ section: PolicySection; compact?: boolean }>();
</script>

<template>
  <article class="section-card">
    <header>
      <span class="section-no">{{ section.section_no }}</span>
      <strong>{{ section.heading }}</strong>
      <RiskTag :value="section.risk_level" />
    </header>
    <p class="section-category">{{ section.category }}</p>
    <p v-if="!compact" class="section-content">{{ section.content }}</p>
  </article>
</template>
