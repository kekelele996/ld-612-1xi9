import { mockData } from "../mocks/seedData";
import { readCollection, writeCollection } from "./localStore";
import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { PolicySection } from "../types/PolicySection";

const COLLECTION = "policySection";

export async function listPolicySection(): Promise<PolicySection[]> {
  return readCollection<PolicySection>(COLLECTION, mockData.policySection as unknown as PolicySection[]);
}

export async function savePolicySection(payload: PolicySection): Promise<PolicySection> {
  const rows = await listPolicySection();
  const index = rows.findIndex((row) => row.id === payload.id);
  if (index >= 0) rows[index] = payload;
  else rows.push(payload);
  writeCollection(COLLECTION, rows);
  console.info(LOG_TEMPLATES.PolicySection.update, payload);
  return payload;
}
