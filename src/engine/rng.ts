/**
 * Deterministic seeded PRNG (mulberry32).
 * Pass the run seed so champion generation is reproducible.
 */
export function createRng(seed: number) {
  let s = seed >>> 0;
  return {
    /** Returns float in [0, 1) */
    next(): number {
      s += 0x6d2b79f5;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },
    /** Returns integer in [min, max] inclusive */
    int(min: number, max: number): number {
      return Math.floor(this.next() * (max - min + 1)) + min;
    },
    /** Picks a random element from an array */
    pick<T>(arr: readonly T[]): T {
      return arr[this.int(0, arr.length - 1)];
    },
    /** Shuffles array in place (Fisher-Yates) */
    shuffle<T>(arr: T[]): T[] {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = this.int(0, i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  };
}

export type Rng = ReturnType<typeof createRng>;
