<script setup lang="ts">
defineProps<{ oldLabel?: string; newLabel?: string; oldText?: string; newText?: string }>();
</script>

<template>
  <div class="diff-viewer">
    <div class="diff-pane">
      <header>{{ oldLabel ?? "旧版" }}</header>
      <p :class="{ missing: !oldText }">{{ oldText || "（旧版无对应条款）" }}</p>
    </div>
    <div class="diff-pane">
      <header>{{ newLabel ?? "新版" }}</header>
      <p :class="{ missing: !newText }">{{ newText || "（新版无对应条款）" }}</p>
    </div>
  </div>
</template>
