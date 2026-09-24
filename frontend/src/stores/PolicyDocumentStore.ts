import { defineStore } from "pinia";
import { listPolicyDocument } from "../api/PolicyDocument";
import type { PolicyDocument } from "../types/PolicyDocument";

export const usePolicyDocumentStore = defineStore("policyDocument", {
  state: () => ({ rows: [] as PolicyDocument[], loading: false }),
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listPolicyDocument();
      } finally {
        this.loading = false;
      }
    }
  }
});
