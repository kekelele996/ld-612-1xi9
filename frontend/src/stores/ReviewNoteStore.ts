import { defineStore } from "pinia";
import { listReviewNote } from "../api/ReviewNote";
import { ReviewStatus } from "../constants/ReviewStatus";
import type { ReviewNote } from "../types/ReviewNote";
import type { ReviewStatus as ReviewStatusValue } from "../types/ReviewStatus";

interface ReviewNoteState {
  rows: ReviewNote[];
  loading: boolean;
  filter: ReviewStatusValue | "ALL";
  lastError: string;
}

/** 各状态数量，驱动页签角标与顶部统计，筛选后随即更新 */
export const useReviewNoteStore = defineStore("reviewNote", {
  state: (): ReviewNoteState => ({
    rows: [],
    loading: false,
    filter: "ALL",
    lastError: ""
  }),
  getters: {
    counts(state): Record<ReviewStatusValue, number> {
      const result = Object.fromEntries(ReviewStatus.map((value) => [value, 0])) as Record<
        ReviewStatusValue,
        number
      >;
      for (const row of state.rows) result[row.status] += 1;
      return result;
    },
    total(state): number {
      return state.rows.length;
    },
    filteredRows(state): ReviewNote[] {
      if (state.filter === "ALL") return state.rows;
      return state.rows.filter((row) => row.status === state.filter);
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listReviewNote();
        this.lastError = "";
      } finally {
        this.loading = false;
      }
    },
    setFilter(filter: ReviewStatusValue | "ALL") {
      this.filter = filter;
    },
    /** 保存成功后用返回值原地替换，列表数量与状态立即更新 */
    upsertRow(note: ReviewNote) {
      const index = this.rows.findIndex((row) => row.id === note.id);
      if (index >= 0) this.rows.splice(index, 1, note);
      else this.rows.push(note);
    },
    replaceRows(rows: ReviewNote[]) {
      this.rows = rows;
    }
  }
});
