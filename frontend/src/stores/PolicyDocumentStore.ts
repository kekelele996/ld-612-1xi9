import { defineStore } from "pinia";
import { listPolicyDocument } from "../api/PolicyDocument";
import type { PolicyDocument } from "../types/PolicyDocument";

interface PolicyDocumentState {
  rows: PolicyDocument[];
  loading: boolean;
}

export const usePolicyDocumentStore = defineStore("policyDocument", {
  state: (): PolicyDocumentState => ({ rows: [], loading: false }),
  getters: {
    latest(state): PolicyDocument | undefined {
      return [...state.rows].sort((a, b) => b.imported_at.localeCompare(a.imported_at))[0];
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listPolicyDocument();
      } finally {
        this.loading = false;
      }
    },
    appendRow(document: PolicyDocument) {
      if (!this.rows.some((row) => row.id === document.id)) this.rows.push(document);
    }
  }
});
