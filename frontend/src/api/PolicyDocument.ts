import { mockData } from "../mocks/seedData";
import { readCollection } from "./localStore";
import type { PolicyDocument } from "../types/PolicyDocument";

const COLLECTION = "policyDocument";

export async function listPolicyDocument(): Promise<PolicyDocument[]> {
  return readCollection<PolicyDocument>(COLLECTION, mockData.policyDocument as unknown as PolicyDocument[]);
}
