import { ref } from "vue";

/**
 * 通用 localStorage 响应式状态：key 变化或首次挂载时读取本机数据。
 */
export function useLocalStorageState<T>(key: string, initial: T) {
  const storageKey = `policy-diff:state:${key}`;
  const read = (): T => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  };

  const value = ref(read()) as ReturnType<typeof ref<T>>;

  const persist = (next: T) => {
    value.value = next;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // 忽略写入失败，界面仍可继续操作
    }
  };

  return { value, persist };
}
