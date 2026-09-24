export const ReviewStatus = ["OPEN", "CONFIRMED", "IGNORED", "RESOLVED"] as const;
export type ReviewStatus = (typeof ReviewStatus)[number];

export interface ReviewStatusMeta {
  value: ReviewStatus;
  label: string;
}
