import type { Status } from "@/types";
import {
  PANE_OPACITY_HIDDEN,
  PANE_OPACITY_VISIBLE,
  PANE_TRANSITION_EASE,
  STATUS_FILLS,
} from "./constants";

export const hidePaneImmediately = (
  pane: HTMLElement | null,
  opacity = PANE_OPACITY_HIDDEN
): void => {
  if (!pane) return;

  pane.style.opacity = opacity;
};

export const fadePaneIn = (pane: HTMLElement | null, transition = PANE_TRANSITION_EASE): void => {
  if (!pane) return;
  requestAnimationFrame(() => {
    pane.style.transition = transition;
    pane.style.opacity = PANE_OPACITY_VISIBLE;
  });
};

export const chunkAnimationFrame = <T>(
  items: T[],
  chunkSize: number,
  process: (item: T) => void
): Promise<void> =>
  new Promise((resolve) => {
    let i = 0;
    const tick = () => {
      const end = Math.min(i + chunkSize, items.length);
      for (; i < end; i++) process(items[i]);
      if (i < items.length) requestAnimationFrame(tick);
      else resolve();
    };
    requestAnimationFrame(tick);
  });

export const STATUS_COLOUR_CASES = Object.entries(STATUS_FILLS)
  .filter(([key]) => key !== "default")
  .map(([status, fill]) => [status as Status, fill.colour] as const);
