import { mockData } from "../mocks/seedData";
import { readCollection } from "./localStore";
import type { DiffResult } from "../types/DiffResult";

const COLLECTION = "diffResult";

export async function listDiffResult(): Promise<DiffResult[]> {
  return readCollection<DiffResult>(COLLECTION, mockData.diffResult as unknown as DiffResult[]);
}
