import { ERROR_CODES } from "../constants/errorCodes";
import { ControllerError } from "../utils/errors";
import {
  getAllSections,
  updatePolicySection,
  type SectionUpdatePayload
} from "../services/PolicySectionService";
import type { PolicySection } from "../types/PolicySection";

/** 风险标注 / 条款编辑控制器，负责再包装 service 异常 */
export async function fetchSections(): Promise<PolicySection[]> {
  try {
    return await getAllSections();
  } catch (error) {
    throw new ControllerError(ERROR_CODES.VALIDATION_FAILED, error, { field: "条款列表" });
  }
}

export async function saveSectionAction(
  payload: SectionUpdatePayload
): Promise<{ section: PolicySection; reopenedCount: number }> {
  try {
    return await updatePolicySection(payload);
  } catch (error) {
    if (error instanceof ControllerError) throw error;
    throw error;
  }
}
