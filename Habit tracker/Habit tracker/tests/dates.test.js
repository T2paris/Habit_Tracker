import { describe, it, expect } from "vitest";
import { toISODate, parseISO, canMarkDate } from "../src/utils/dates";

describe("dates utils", () => {
  it("toISODate() gera YYYY-MM-DD", () => {
    const iso = toISODate(new Date(2026, 0, 5)); // 5 Jan 2026
    expect(iso).toBe("2026-01-05");
  });

  it("parseISO() cria uma Date correta", () => {
    const d = parseISO("2026-01-25");
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(0); // janeiro = 0
    expect(d.getDate()).toBe(25);
  });

  it("canMarkDate() não permite marcar no futuro", () => {
    const today = "2026-01-25";
    expect(canMarkDate("2026-01-27", today)).toBe(false);
    expect(canMarkDate("2026-01-25", today)).toBe(true);
    expect(canMarkDate("2026-01-20", today)).toBe(true);
  });
});
