/**
 * localStorage 读写封装：审阅处理意见全部保存在本机。
 * 首次访问某个实体时用种子数据初始化，之后完全以本机数据为准。
 */
const PREFIX = "policy-diff:";

export function readLocalRows<T>(key: string, seed: T[]): T[] {
  const storageKey = PREFIX + key;
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw == null) {
      localStorage.setItem(storageKey, JSON.stringify(seed));
      return clone(seed);
    }
    return JSON.parse(raw) as T[];
  } catch {
    return clone(seed);
  }
}

export function writeLocalRows<T>(key: string, rows: T[]): T[] {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(rows));
  } catch {
    // 存储空间不足等异常时仍返回内存数据，避免操作中断
  }
  return clone(rows);
}

export function nextLocalId(rows: { id: number }[]): number {
  return rows.reduce((max, row) => Math.max(max, row.id), 0) + 1;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
