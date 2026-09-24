import { defineStore } from "pinia";
import { listDiffResult } from "../api/DiffResult";
import type { DiffResult } from "../types/DiffResult";
import type { DiffType as DiffTypeValue } from "../types/DiffType";

interface DiffResultState {
  rows: DiffResult[];
  loading: boolean;
  typeFilter: DiffTypeValue | "ALL";
}

export const useDiffResultStore = defineStore("diffResult", {
  state: (): DiffResultState => ({ rows: [], loading: false, typeFilter: "ALL" }),
  getters: {
    filteredRows(state): DiffResult[] {
      if (state.typeFilter === "ALL") return state.rows;
      return state.rows.filter((row) => row.diff_type === state.typeFilter);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listDiffResult();
      } finally {
        this.loading = false;
      }
    },
    setTypeFilter(filter: DiffTypeValue | "ALL") {
      this.typeFilter = filter;
    },
    replaceRows(rows: DiffResult[]) {
      this.rows = rows;
    }
  }
});
