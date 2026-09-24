import { ERROR_CODES } from "../constants/errorCodes";
import { ControllerError } from "../utils/errors";
import {
  getAllReviewNotes,
  submitReviewNote,
  type SaveReviewDraft,
  type SaveReviewContext
} from "../services/ReviewService";
import { buildReviewReport, downloadReviewReport, type ReviewReportContext } from "../services/ReviewReportService";
import type { ReviewNote } from "../types/ReviewNote";

/**
 * 审阅清单控制器：页面只与控制器对话。
 * service 抛 ServiceError（含校验规则），控制器再包一层 ControllerError，
 * 页面拿到统一的错误消息展示；不允许在全局错误处理里吞掉异常。
 */
export async function fetchReviewNotes(): Promise<ReviewNote[]> {
  try {
    return await getAllReviewNotes();
  } catch (error) {
    throw new ControllerError(ERROR_CODES.VALIDATION_FAILED, error, { field: "审阅备注列表" });
  }
}

export async function saveReviewNoteAction(
  draft: SaveReviewDraft,
  context: SaveReviewContext
): Promise<ReviewNote> {
  try {
    return await submitReviewNote(draft, context);
  } catch (error) {
    if (error instanceof ControllerError) throw error;
    // 已忽略未填原因、处理人为空等 ServiceError 直接保留其消息
    throw error;
  }
}

export function exportReviewReport(context: ReviewReportContext): string {
  try {
    const markdown = buildReviewReport(context);
    return downloadReviewReport(markdown);
  } catch (error) {
    throw new ControllerError(ERROR_CODES.VALIDATION_FAILED, error, { field: "审阅报告导出" });
  }
}
