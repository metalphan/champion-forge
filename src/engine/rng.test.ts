import { describe, it, expect } from "vitest";
import { createRng } from "./rng";

describe("createRng", () => {
  it("produces values in [0, 1)", () => {
    const rng = createRng(12345);
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("is deterministic for the same seed", () => {
    const a = createRng(99);
    const b = createRng(99);
    for (let i = 0; i < 20; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  it("produces different sequences for different seeds", () => {
    const a = createRng(1);
    const b = createRng(2);
    const valA = Array.from({ length: 5 }, () => a.next());
    const valB = Array.from({ length: 5 }, () => b.next());
    expect(valA).not.toEqual(valB);
  });

  it("int returns inclusive range", () => {
    const rng = createRng(42);
    for (let i = 0; i < 200; i++) {
      const v = rng.int(3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });

  it("int(n, n) always returns n", () => {
    const rng = createRng(1);
    for (let i = 0; i < 10; i++) {
      expect(rng.int(5, 5)).toBe(5);
    }
  });

  it("pick returns an element from the array", () => {
    const rng = createRng(7);
    const arr = ["a", "b", "c", "d"];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(rng.pick(arr));
    }
  });

  it("shuffle preserves all elements", () => {
    const rng = createRng(3);
    const original = [1, 2, 3, 4, 5];
    const shuffled = rng.shuffle([...original]);
    expect(shuffled.sort()).toEqual(original.sort());
  });
});
