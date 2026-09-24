import { seedData } from "../mocks/seedData";
import type { ReviewNote } from "../types/ReviewNote";
import { nextLocalId, readLocalRows, writeLocalRows } from "../utils/localStorage";

const STORAGE_KEY = "reviewNote";

/** 读取本机保存的审阅备注；首次访问用种子数据初始化 */
export async function listReviewNote(): Promise<ReviewNote[]> {
  return readLocalRows<ReviewNote>(STORAGE_KEY, seedData.reviewNote);
}

/** 新建或更新处理意见并保存到本机，返回保存后的副本 */
export async function saveReviewNote(payload: ReviewNote): Promise<ReviewNote> {
  const rows = readLocalRows<ReviewNote>(STORAGE_KEY, seedData.reviewNote);
  const now = new Date().toISOString();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) {
    rows[index] = { ...payload, updated_at: now };
  } else {
    const id = nextLocalId(rows);
    const created: ReviewNote = { ...payload, id, created_at: now, updated_at: now };
    rows.push(created);
    writeLocalRows(STORAGE_KEY, rows);
    return { ...created };
  }
  writeLocalRows(STORAGE_KEY, rows);
  return { ...rows[index] };
}
