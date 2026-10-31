import { expect } from "vitest";

export const expectResult = async <T>(fn: () => Promise<T>, expected: T) =>
  expect(await fn()).toEqual(expected);
