import type { DiffType as DiffTypeValue, DiffTypeMeta } from "../types/DiffType";

export const DiffType = ["ADDED", "REMOVED", "MODIFIED", "MOVED", "UNCHANGED"] as const;

export const DiffTypeText: Record<DiffTypeValue, string> = {
  ADDED: "新增",
  REMOVED: "删除",
  MODIFIED: "修改",
  MOVED: "移动",
  UNCHANGED: "未变化"
};

/** 版本对比页差异类型过滤选项 */
export const DIFF_TYPE_FILTERS: DiffTypeMeta[] = DiffType.map((value) => ({
  value,
  label: DiffTypeText[value]
}));
