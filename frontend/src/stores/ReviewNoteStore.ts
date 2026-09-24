import { defineStore } from "pinia";
import { listReviewNote, saveReviewNote, saveReviewNoteList } from "../api/ReviewNote";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { ReviewStatus } from "../types/ReviewStatus";
import type { ReviewNote } from "../types/ReviewNote";
import type { PolicySection } from "../types/PolicySection";

export type ReviewNoteFilter = ReviewStatus | "ALL";

interface ReviewNoteState {
  rows: ReviewNote[];
  loading: boolean;
  filter: ReviewNoteFilter;
  error: string;
}

export const useReviewNoteStore = defineStore("reviewNote", {
  state: (): ReviewNoteState => ({ rows: [], loading: false, filter: "ALL", error: "" }),
  getters: {
    filteredRows: (state): ReviewNote[] =>
      state.filter === "ALL" ? state.rows : state.rows.filter((row) => row.status === state.filter),
    counts: (state): Record<ReviewNoteFilter, number> => {
      const counts: Record<ReviewNoteFilter, number> = { ALL: state.rows.length, OPEN: 0, CONFIRMED: 0, IGNORED: 0, RESOLVED: 0 };
      for (const row of state.rows) {
        if (row.status in counts) counts[row.status] += 1;
      }
      return counts;
    }
  },
  actions: {
    async load() {
      this.loading = true;
      try {
        this.rows = await listReviewNote();
      } finally {
        this.loading = false;
      }
    },
    setFilter(filter: ReviewNoteFilter) {
      this.filter = filter;
    },
    async save(note: ReviewNote): Promise<boolean> {
      this.error = "";
      try {
        const saved = await saveReviewNote(note);
        const index = this.rows.findIndex((row) => row.id === saved.id);
        if (index >= 0) this.rows.splice(index, 1, saved);
        else this.rows.push(saved);
        return true;
      } catch (err) {
        this.error = err instanceof Error ? err.message : ERROR_MESSAGES.VALIDATION_FAILED;
        return false;
      }
    },
    reconcileResolvedNotes(sections: PolicySection[]): number {
      const now = new Date().toISOString();
      let reverted = 0;
      for (const note of this.rows) {
        if (note.status !== "RESOLVED" || note.resolved_section_id == null) continue;
        const section = sections.find((item) => item.id === note.resolved_section_id);
        if (!section) continue;
        if (section.content !== note.resolved_section_content || section.risk_level !== note.resolved_risk_level) {
          note.status = "OPEN";
          note.updated_at = now;
          note.history = [
            ...note.history,
            {
              status: "OPEN",
              reviewer: note.reviewer,
              comment: note.comment,
              reason: "对应条款正文或风险等级发生变化，自动退回待处理",
              changed_at: now
            }
          ];
          reverted += 1;
          console.info(LOG_TEMPLATES.ReviewNote.reopen, note.id);
        }
      }
      if (reverted > 0) void saveReviewNoteList(this.rows);
      return reverted;
    }
  }
});
