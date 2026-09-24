import { seedData } from "../mocks/seedData";
import type { PolicyDocument } from "../types/PolicyDocument";
import { nextLocalId, readLocalRows, writeLocalRows } from "../utils/localStorage";

const STORAGE_KEY = "policyDocument";

export async function listPolicyDocument(): Promise<PolicyDocument[]> {
  return readLocalRows<PolicyDocument>(STORAGE_KEY, seedData.policyDocument);
}

export function listPolicyDocumentNow(): PolicyDocument[] {
  return readLocalRows<PolicyDocument>(STORAGE_KEY, seedData.policyDocument);
}

/** 导入新版本文档并保存到本机 */
export async function savePolicyDocument(payload: PolicyDocument): Promise<PolicyDocument> {
  const rows = readLocalRows<PolicyDocument>(STORAGE_KEY, seedData.policyDocument);
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) {
    rows[index] = { ...payload };
  } else {
    const id = nextLocalId(rows);
    const now = new Date().toISOString();
    rows.push({ ...payload, id, imported_at: payload.imported_at || now });
  }
  writeLocalRows(STORAGE_KEY, rows);
  const saved = rows.find((row) => row.title === payload.title && row.version_label === payload.version_label);
  return { ...(saved ?? payload) };
}
