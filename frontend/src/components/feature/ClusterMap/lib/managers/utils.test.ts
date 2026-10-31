import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { hidePaneImmediately, fadePaneIn, chunkAnimationFrame } from "./utils";
import {
  CUSTOM_OPACITY,
  CUSTOM_TRANSITION,
  PANE_OPACITY_HIDDEN,
  PANE_OPACITY_VISIBLE,
  PANE_TRANSITION_EASE,
} from "./constants";

describe("hidePaneImmediately", () => {
  it("sets opacity to hidden when pane is provided", () => {
    const pane = document.createElement("div");
    hidePaneImmediately(pane);
    expect(pane.style.opacity).toBe(PANE_OPACITY_HIDDEN);
  });

  it("does nothing when pane is null", () => {
    expect(() => hidePaneImmediately(null)).not.toThrow();
  });

  it("accepts a custom opacity value", () => {
    const pane = document.createElement("div");
    hidePaneImmediately(pane, CUSTOM_OPACITY);
    expect(pane.style.opacity).toBe(CUSTOM_OPACITY);
  });
});

describe("fadePaneIn", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sets transition and opacity to visible after rAF fires", () => {
    const pane = document.createElement("div");
    fadePaneIn(pane);
    expect(pane.style.transition).toBe(PANE_TRANSITION_EASE);
    expect(pane.style.opacity).toBe(PANE_OPACITY_VISIBLE);
  });

  it("uses a custom transition when provided", () => {
    const pane = document.createElement("div");
    fadePaneIn(pane, CUSTOM_TRANSITION);
    expect(pane.style.transition).toBe(CUSTOM_TRANSITION);
  });

  it("does nothing when pane is null", () => {
    expect(() => fadePaneIn(null)).not.toThrow();
  });
});

describe("chunkAnimationFrame", () => {
  beforeEach(() => {
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves immediately when the item list is empty", async () => {
    await expect(chunkAnimationFrame([], 2, () => {})).resolves.toBeUndefined();
  });

  it("processes all items in a single chunk when count <= chunkSize", async () => {
    const results: number[] = [];
    await chunkAnimationFrame([1, 2, 3], 10, (x) => results.push(x));
    expect(results).toEqual([1, 2, 3]);
  });

  it("processes all items across multiple chunks when count > chunkSize", async () => {
    const results: number[] = [];
    await chunkAnimationFrame([1, 2, 3, 4, 5], 2, (x) => results.push(x));
    expect(results).toEqual([1, 2, 3, 4, 5]);
  });

  it("calls requestAnimationFrame multiple times for multi-chunk lists", async () => {
    const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    await chunkAnimationFrame([1, 2, 3, 4, 5], 2, () => {});
    expect(rafSpy).toHaveBeenCalledTimes(3);
  });

  it("calls the process callback once per item", async () => {
    const process = vi.fn();
    const items = ["a", "b", "c", "d"];
    await chunkAnimationFrame(items, 2, process);
    expect(process).toHaveBeenCalledTimes(items.length);
    items.forEach((item, i) => {
      expect(process).toHaveBeenNthCalledWith(i + 1, item);
    });
  });

  it("resolves after all items are processed", async () => {
    let resolved = false;
    chunkAnimationFrame([1, 2, 3], 2, () => {}).then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(true);
  });
});
