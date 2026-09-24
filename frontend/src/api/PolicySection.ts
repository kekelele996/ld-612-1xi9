import { seedData } from "../mocks/seedData";
import type { PolicySection } from "../types/PolicySection";
import { nextLocalId, readLocalRows, writeLocalRows } from "../utils/localStorage";

const STORAGE_KEY = "policySection";

export async function listPolicySection(): Promise<PolicySection[]> {
  return readLocalRows<PolicySection>(STORAGE_KEY, seedData.policySection);
}

export function listPolicySectionNow(): PolicySection[] {
  return readLocalRows<PolicySection>(STORAGE_KEY, seedData.policySection);
}

export async function savePolicySection(payload: PolicySection): Promise<PolicySection> {
  const rows = readLocalRows<PolicySection>(STORAGE_KEY, seedData.policySection);
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

/** 批量写入自动分段产生的条款 */
export function appendPolicySections(sections: PolicySection[]): PolicySection[] {
  const rows = readLocalRows<PolicySection>(STORAGE_KEY, seedData.policySection);
  let id = nextLocalId(rows) - 1;
  for (const section of sections) {
    id += 1;
    rows.push({ ...section, id });
  }
  writeLocalRows(STORAGE_KEY, rows);
  return rows;
}
