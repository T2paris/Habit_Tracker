import { describe, it, expect } from "vitest";
import { overallPercent, inProgressOnly, isCompleted } from "../src/utils/habits";

describe("habits utils", () => {
  it("overallPercent() calcula percentagem geral com clamp", () => {
    const items = [
      { target: 10, progress: 2 },
      { target: 5, progress: 5 },
    ];
    // total target = 15, total progress = 7 => 46.66 => 47
    expect(overallPercent(items)).toBe(47);
  });

  it("inProgressOnly() remove hábitos completos", () => {
    const items = [
      { id: 1, target: 3, progress: 3 },
      { id: 2, target: 4, progress: 2 },
      { id: 3, target: 1, progress: 0 },
    ];
    const list = inProgressOnly(items);
    expect(list.map((x) => x.id)).toEqual([2, 3]);
  });

  it("isCompleted() valida conclusão", () => {
    expect(isCompleted({ target: 3, progress: 3 })).toBe(true);
    expect(isCompleted({ target: 3, progress: 2 })).toBe(false);
    expect(isCompleted({ target: 0, progress: 10 })).toBe(false);
  });
});
