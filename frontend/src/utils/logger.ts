import { LOG_TEMPLATES } from "../constants/logTemplates";
import type { LogAction, LogEntity } from "../constants/logTemplates";

export interface LogEntry {
  entity: LogEntity;
  action: LogAction;
  message: string;
  at: string;
}

const MAX_LOGS = 200;
const LOG_KEY = "policy-diff:operation-logs";

/** 按日志模板渲染并写入本机操作日志（所有写操作都要经过这里） */
export function logOperation(
  entity: LogEntity,
  action: LogAction,
  params: Record<string, string | number> = {}
): LogEntry {
  const template = LOG_TEMPLATES[entity][action];
  const message = template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] == null ? `{${key}}` : String(params[key])
  );
  const entry: LogEntry = { entity, action, message, at: new Date().toISOString() };
  try {
    const raw = localStorage.getItem(LOG_KEY);
    const logs: LogEntry[] = raw ? (JSON.parse(raw) as LogEntry[]) : [];
    logs.unshift(entry);
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, MAX_LOGS)));
  } catch {
    // 日志失败不阻断业务写操作
  }
  // 同时输出到控制台，便于本地排查
  console.info(`[${entry.at}] ${entry.message}`);
  return entry;
}

export function listOperationLogs(): LogEntry[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? (JSON.parse(raw) as LogEntry[]) : [];
  } catch {
    return [];
  }
}
