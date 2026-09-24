import { defineStore } from "pinia";
import { listPolicySection } from "../api/PolicySection";
import type { PolicySection } from "../types/PolicySection";

interface PolicySectionState {
  rows: PolicySection[];
  loading: boolean;
  categoryFilter: string;
}

export const usePolicySectionStore = defineStore("policySection", {
  state: (): PolicySectionState => ({ rows: [], loading: false, categoryFilter: "ALL" }),
  getters: {
    categories(state): string[] {
      return ["ALL", ...new Set(state.rows.map((row) => row.category))];
    },
    filteredRows(state): PolicySection[] {
      if (state.categoryFilter === "ALL") return state.rows;
      return state.rows.filter((row) => row.category === state.categoryFilter);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listPolicySection();
      } finally {
        this.loading = false;
      }
    },
    setCategoryFilter(filter: string) {
      this.categoryFilter = filter;
    },
    upsertRow(section: PolicySection) {
      const index = this.rows.findIndex((row) => row.id === section.id);
      if (index >= 0) this.rows.splice(index, 1, section);
      else this.rows.push(section);
    }
  }
});
