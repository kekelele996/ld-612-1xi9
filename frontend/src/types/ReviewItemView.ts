import type { DiffResult } from "./DiffResult";
import type { PolicyDocument } from "./PolicyDocument";
import type { PolicySection } from "./PolicySection";
import type { ReviewNote } from "./ReviewNote";

export interface ReviewItemView {
  note: ReviewNote;
  diff?: DiffResult;
  oldDoc?: PolicyDocument;
  newDoc?: PolicyDocument;
  oldSection?: PolicySection;
  newSection?: PolicySection;
}
