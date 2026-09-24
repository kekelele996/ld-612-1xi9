const PREFIX = "policy-diff:v1";

export function readCollection<T>(key: string, seed: T[]): T[] {
  if (typeof localStorage === "undefined") return seed.map((item) => ({ ...item }));
  try {
    const raw = localStorage.getItem(`${PREFIX}:${key}`);
    if (raw) return JSON.parse(raw) as T[];
  } catch {
    // Fall back to seed data when the stored payload is corrupted.
  }
  return seed.map((item) => ({ ...item }));
}

export function writeCollection<T>(key: string, rows: T[]): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(rows));
}
