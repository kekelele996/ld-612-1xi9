import { seedData } from "../mocks/seedData";
import type { DiffResult } from "../types/DiffResult";
import { nextLocalId, readLocalRows, writeLocalRows } from "../utils/localStorage";

const STORAGE_KEY = "diffResult";

export async function listDiffResult(): Promise<DiffResult[]> {
  return readLocalRows<DiffResult>(STORAGE_KEY, seedData.diffResult);
}

export function listDiffResultNow(): DiffResult[] {
  return readLocalRows<DiffResult>(STORAGE_KEY, seedData.diffResult);
}

export async function saveDiffResult(payload: DiffResult): Promise<DiffResult> {
  const rows = readLocalRows<DiffResult>(STORAGE_KEY, seedData.diffResult);
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) {
    rows[index] = { ...payload };
  } else {
    const id = nextLocalId(rows);
    rows.push({ ...payload, id });
  }
  writeLocalRows(STORAGE_KEY, rows);
  return { ...(rows.find((row) => row.id === payload.id) ?? payload) };
}

/** 重新对比后以差异集合整体覆盖本机数据（保留已有 id） */
export function replaceDiffResults(rows: DiffResult[]): DiffResult[] {
  return writeLocalRows(STORAGE_KEY, rows);
}
