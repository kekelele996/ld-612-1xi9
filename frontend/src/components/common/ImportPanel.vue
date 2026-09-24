<script setup lang="ts">
import { reactive, ref } from "vue";
import { usePolicyParser } from "../../hooks/usePolicyParser";

const emit = defineEmits<{
  (e: "import", payload: { title: string; version_label: string; raw_text: string }): void;
}>();

const form = reactive({ title: "", version_label: "", raw_text: "" });
const previewCount = ref(0);
const error = ref("");

const { parse } = usePolicyParser();

const updatePreview = () => {
  if (!form.raw_text.trim()) {
    previewCount.value = 0;
    return;
  }
  previewCount.value = parse(form.raw_text, 0).length;
};

const submit = () => {
  error.value = "";
  if (!form.title.trim() || !form.version_label.trim()) {
    error.value = "请填写政策标题与版本标签后再导入。";
    return;
  }
  if (!form.raw_text.trim()) {
    error.value = "请粘贴政策全文后再导入。";
    return;
  }
  emit("import", { ...form });
  form.raw_text = "";
  previewCount.value = 0;
};
</script>

<template>
  <div class="import-panel panel">
    <h2>导入新版本</h2>
    <div class="form-grid">
      <label>
        政策标题
        <input v-model="form.title" type="text" placeholder="如：XX 产品隐私政策" />
      </label>
      <label>
        版本标签
        <input v-model="form.version_label" type="text" placeholder="如：v3.0（2027 版）" />
      </label>
      <label class="full">
        政策全文
        <textarea
          v-model="form.raw_text"
          rows="10"
          placeholder="粘贴政策全文，支持“第一条 / 一、 / 1.”等条款格式，系统会自动分段"
          @input="updatePreview"
        ></textarea>
      </label>
    </div>
    <p v-if="error" class="form-error">{{ error }}</p>
    <div class="import-actions">
      <span class="preview-hint" v-if="previewCount > 0">识别到 {{ previewCount }} 个条款</span>
      <button type="button" class="btn primary" @click="submit">导入并自动分段</button>
    </div>
  </div>
</template>
