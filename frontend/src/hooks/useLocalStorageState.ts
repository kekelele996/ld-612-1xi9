import { ref, watch, type Ref } from "vue";

const PREFIX = "policy-diff:v1";

export function useLocalStorageState<T>(key: string, initial: T): Ref<T> {
  const state = ref(initial) as Ref<T>;
  try {
    const raw = localStorage.getItem(`${PREFIX}:${key}`);
    if (raw) state.value = JSON.parse(raw) as T;
  } catch {
    // Keep the initial value when the stored payload is missing or corrupted.
  }
  watch(
    state,
    (value) => {
      try {
        localStorage.setItem(`${PREFIX}:${key}`, JSON.stringify(value));
      } catch {
        // Storage may be unavailable (private mode); the state still works in memory.
      }
    },
    { deep: true }
  );
  return state;
}
