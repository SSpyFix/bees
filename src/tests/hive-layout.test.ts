import { describe, expect, it } from "vitest";
import map from "../game/data/imported-map.json";
import { hiveCellsForSwarm } from "../game/world/hive-layout";

describe("owned hive portraits", () => {
  it("preserves source positions for ordinary swarms", () => {
    const cells = hiveCellsForSwarm(map.hiveCells[0], 2);
    expect(cells).toHaveLength(2);
    expect(cells[0]).toBe(map.hiveCells[0][0]);
    expect(cells[1]).toBe(map.hiveCells[0][1]);
  });
  it("extends every exported 40-cell board to display the supported 50 owned bees", () => {
    for (const source of map.hiveCells) {
      const cells = hiveCellsForSwarm(source, 50);
      expect(cells).toHaveLength(50);
      expect(cells.slice(0, 40)).toEqual(source);
      expect(new Set(cells.map((c) => c.position.join(","))).size).toBe(50);
      const oldTop = Math.max(...source.map((c) => c.position[1]));
      for (const cell of cells.slice(40)) {
        expect(cell.position.every(Number.isFinite)).toBe(true);
        expect(cell.position[1]).toBeGreaterThan(oldTop);
        expect(cell.extra).toBe(true);
      }
    }
  });
});
