import type { ReviewStatus } from "./ReviewStatus";

/** 单条处理记录：状态变更时追加，退回待处理也不覆盖历史 */
export interface ReviewHistoryEntry {
  status: ReviewStatus;
  reviewer: string;
  comment: string;
  acted_at: string;
}

export interface ReviewNote {
  id: number;
  diff_result_id: number;
  tag: string;
  comment: string;
  reviewer: string;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
  /** 最近一次保存时间，供清单与导出展示 */
  history: ReviewHistoryEntry[];
  /** 置为已解决时对应条款（新版/旧版）的正文与风险等级快照，用于变化后退回待处理 */
  resolved_snapshot: ResolvedSnapshot | null;
}

export interface ResolvedSnapshot {
  old_content: string;
  old_risk_level: string;
  new_content: string;
  new_risk_level: string;
  resolved_at: string;
}
