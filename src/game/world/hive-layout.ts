export type HiveCell = { position: number[]; rotation: number[]; size: number[]; extra?: boolean };

export function hiveCellsForSwarm(source: readonly HiveCell[], count: number): HiveCell[] {
  const target = Number.isFinite(count) ? Math.max(0, Math.min(50, Math.floor(count))) : 0;
  const cells = source.slice(0, target);
  if (!source.length) return cells;
  const columns = Math.min(5, source.length);
  const first = source[0], nextRow = source[columns];
  const step = nextRow ? first.position.map((v, axis) => nextRow.position[axis] - v) : [0, first.size[1], 0];
  for (let index = cells.length; index < target; index++) {
    const template = source[index % columns], row = Math.floor(index / columns);
    cells.push({ ...template, position: template.position.map((v, axis) => v + step[axis] * row), extra: true });
  }
  return cells;
}
