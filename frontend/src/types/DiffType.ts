export const DiffType = ["ADDED", "REMOVED", "MODIFIED", "MOVED", "UNCHANGED"] as const;
export type DiffType = (typeof DiffType)[number];

export interface DiffTypeMeta {
  value: DiffType;
  label: string;
}
