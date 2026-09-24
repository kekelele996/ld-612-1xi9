import { defineStore } from "pinia";
import { listPolicySection, savePolicySection } from "../api/PolicySection";
import { useReviewNoteStore } from "./ReviewNoteStore";
import type { PolicySection } from "../types/PolicySection";

export const usePolicySectionStore = defineStore("policySection", {
  state: () => ({ rows: [] as PolicySection[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listPolicySection();
      } finally {
        this.loading = false;
      }
    },
    async updateSection(payload: PolicySection): Promise<number> {
      const saved = await savePolicySection(payload);
      const index = this.rows.findIndex((row) => row.id === saved.id);
      if (index >= 0) this.rows.splice(index, 1, saved);
      else this.rows.push(saved);
      return useReviewNoteStore().reconcileResolvedNotes(this.rows);
    }
  }
});
