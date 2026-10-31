import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePersistedState } from "./usePersistedState";

const TEST_KEY = "test-storage-key";
const VALUE_A = "first-value";
const VALUE_B = "second-value";

describe("usePersistedState", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it("restores value from localStorage on mount", () => {
    localStorage.setItem(TEST_KEY, VALUE_A);
    const { result } = renderHook(() => usePersistedState(TEST_KEY));
    expect(result.current.value).toBe(VALUE_A);
  });

  it("falls back to undefined when nothing is stored", () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY));
    expect(result.current.value).toBeUndefined();
  });

  it("writes to localStorage when value changes", () => {
    const { result } = renderHook(() => usePersistedState(TEST_KEY));
    act(() => result.current.setValue(VALUE_B));
    expect(localStorage.getItem(TEST_KEY)).toBe(VALUE_B);
  });

  it("removes from localStorage when value is cleared", () => {
    localStorage.setItem(TEST_KEY, VALUE_A);
    const { result } = renderHook(() => usePersistedState(TEST_KEY));
    act(() => result.current.setValue(undefined));
    expect(localStorage.getItem(TEST_KEY)).toBeNull();
  });

  it("initial value is available on first render", () => {
    localStorage.setItem(TEST_KEY, VALUE_A);
    const { result } = renderHook(() => usePersistedState(TEST_KEY));
    expect(result.current.value).toBe(VALUE_A);
  });

  it("isolates values between different keys", () => {
    const otherKey = "other-key";
    localStorage.setItem(TEST_KEY, VALUE_A);
    localStorage.setItem(otherKey, VALUE_B);

    const { result: resultA } = renderHook(() => usePersistedState(TEST_KEY));
    const { result: resultB } = renderHook(() => usePersistedState(otherKey));

    expect(resultA.current.value).toBe(VALUE_A);
    expect(resultB.current.value).toBe(VALUE_B);
  });
});
