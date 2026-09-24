import { ERROR_CODES } from "../constants/errorCodes";
import { ERROR_MESSAGES } from "../constants/errorMessages";
import type { ErrorCode } from "../constants/errorCodes";

/** service 层抛出的业务异常：携带错误码，消息由错误消息模板渲染 */
export class ServiceError extends Error {
  code: ErrorCode;
  constructor(code: ErrorCode, params: Record<string, string | number> = {}) {
    super(renderMessage(code, params));
    this.name = "ServiceError";
    this.code = code;
  }
}

/** controller 层在 service 异常外再包一层，禁止单一全局位置吞掉全部异常 */
export class ControllerError extends Error {
  code: ErrorCode;
  cause?: unknown;
  constructor(code: ErrorCode, cause?: unknown, params: Record<string, string | number> = {}) {
    super(renderMessage(code, params));
    this.name = "ControllerError";
    this.code = code;
    this.cause = cause;
  }
}

export function renderMessage(
  code: ErrorCode,
  params: Record<string, string | number> = {}
): string {
  const template = ERROR_MESSAGES[code] ?? ERROR_MESSAGES[ERROR_CODES.VALIDATION_FAILED];
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    params[key] == null ? `{${key}}` : String(params[key])
  );
}

export function toMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
