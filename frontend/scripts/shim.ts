// Node 冒烟测试前置：localStorage / URL / document 的最小 shim
class MemoryStorage {
  private map = new Map<string, string>();
  getItem(key: string): string | null {
    return this.map.has(key) ? this.map.get(key)! : null;
  }
  setItem(key: string, value: string): void {
    this.map.set(key, String(value));
  }
  removeItem(key: string): void {
    this.map.delete(key);
  }
  clear(): void {
    this.map.clear();
  }
}

(globalThis as Record<string, unknown>).localStorage = new MemoryStorage();

// Node 20 自带 URL 构造器，仅补齐报告下载用到的静态方法
const URLCtor = (globalThis as Record<string, unknown>).URL as
  | (typeof URL & { createObjectURL?: (b: Blob) => string; revokeObjectURL?: (u: string) => void })
  | undefined;
if (URLCtor && !URLCtor.createObjectURL) {
  URLCtor.createObjectURL = () => "blob:mock";
  URLCtor.revokeObjectURL = () => {};
}
(globalThis as Record<string, unknown>).Blob ??= class BlobMock {};

(globalThis as Record<string, unknown>).document = {
  visibilityState: "visible",
  addEventListener: () => {},
  createElement: () => ({ click: () => {}, set href(_v: string) {}, set download(_v: string) {} }),
  body: { appendChild: () => {}, removeChild: () => {} }
};

(globalThis as Record<string, unknown>).location ??= {
  href: "http://localhost:20112/",
  origin: "http://localhost:20112",
  pathname: "/",
  search: "",
  hash: "",
  reload() {}
};
(globalThis as Record<string, unknown>).history ??= { state: null, pushState: () => {}, replaceState: () => {} };
(globalThis as Record<string, unknown>).addEventListener ??= () => {};
(globalThis as Record<string, unknown>).removeEventListener ??= () => {};
