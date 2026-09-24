import { defineStore } from "pinia";
import { listDiffResult } from "../api/DiffResult";
import type { DiffResult } from "../types/DiffResult";

export const useDiffResultStore = defineStore("diffResult", {
  state: () => ({ rows: [] as DiffResult[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listDiffResult();
      } finally {
        this.loading = false;
      }
    }
  }
});
