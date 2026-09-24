import { mockData } from "../mocks/seedData";
import { readCollection, writeCollection } from "./localStore";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { ReviewNote } from "../types/ReviewNote";

const COLLECTION = "reviewNote";

export type ReviewNoteErrorCode = keyof typeof ERROR_MESSAGES;

export class ReviewNoteError extends Error {
  readonly code: ReviewNoteErrorCode;

  constructor(code: ReviewNoteErrorCode) {
    super(ERROR_MESSAGES[code]);
    this.name = "ReviewNoteError";
    this.code = code;
  }
}

export async function listReviewNote(): Promise<ReviewNote[]> {
  return readCollection<ReviewNote>(COLLECTION, mockData.reviewNote as unknown as ReviewNote[]);
}

export async function saveReviewNote(payload: ReviewNote): Promise<ReviewNote> {
  if (payload.status === "IGNORED" && !payload.reason.trim()) {
    console.warn(LOG_TEMPLATES.ReviewNote.invalid, payload.id);
    throw new ReviewNoteError("REVIEW_REASON_REQUIRED");
  }
  const rows = await listReviewNote();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  try {
    writeCollection(COLLECTION, rows);
  } catch {
    throw new ReviewNoteError("STORAGE_UNAVAILABLE");
  }
  console.info(LOG_TEMPLATES.ReviewNote.update, payload);
  return payload;
}

export async function saveReviewNoteList(rows: ReviewNote[]): Promise<void> {
  writeCollection(COLLECTION, rows);
}
