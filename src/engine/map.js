// Act map generation: rows of nodes with guaranteed connectivity.
// Node: { row, col, type } ; edges stored as node.next = [cols...]
export const ROWS = 15; // 0..13 normal, 13 = rest, 14 = boss

export function generateMap(rng, act) {
  const grid = [];
  for (let r = 0; r < ROWS; r++) {
    const cols = r === 0 ? 3 : r === ROWS - 1 ? 1 : rng.int(3, 4);
    const row = [];
    for (let c = 0; c < cols; c++) {
      let type;
      if (r === 0) type = 'combat';
      else if (r === ROWS - 1) type = 'boss';
      else if (r === ROWS - 2) type = 'rest';
      else {
        const w = [];
        w.push(['combat', 34]);
        if (r >= 4) w.push(['elite', 8]);
        w.push(['event', 13]);
        if (r >= 3 && r <= 10) w.push(['shop', 8]);
        if (r >= 4 && r <= 11) w.push(['rest', 11]);
        if (r >= 1 && r <= 11) w.push(['treasure', 6]);
        type = rng.weighted(w);
      }
      row.push({ row: r, col: c, type, next: [] });
    }
    grid.push(row);
  }
  // guarantee at least one rest in rows 5..11
  const restRows = grid.slice(5, 12);
  if (!restRows.some(row => row.some(n => n.type === 'rest'))) {
    const pick = rng.pick(restRows);
    rng.shuffle(pick)[0].type = 'rest';
  }
  // no elite directly before boss-adjacent rest is fine; ensure row 12 has no elite
  for (const n of grid[12]) if (n.type === 'elite' || n.type === 'boss') n.type = 'combat';

  // edges: each node -> 1..3 nodes in next row, near columns; every next-row node gets a parent
  for (let r = 0; r < ROWS - 1; r++) {
    const cur = grid[r], nxt = grid[r + 1];
    const parents = new Map(nxt.map(n => [n.col, []]));
    for (const node of cur) {
      const spread = nxt.length;
      const anchor = Math.min(spread - 1, Math.floor(node.col * spread / cur.length));
      const k = rng.int(1, Math.min(2, spread));
      const choices = [];
      for (let d = -2; d <= 2; d++) {
        const c2 = anchor + d;
        if (c2 >= 0 && c2 < spread) choices.push([c2, 3 - Math.abs(d)]);
      }
      const picked = new Set();
      for (let i = 0; i < k; i++) picked.add(rng.weighted(choices));
      for (const c2 of picked) {
        node.next.push(c2);
        parents.get(c2).push(node.col);
      }
    }
    // orphan fix
    for (const n of nxt) {
      if (parents.get(n.col).length === 0) {
        const parent = rng.pick(cur);
        parent.next.push(n.col);
        parents.get(n.col).push(parent.col);
      }
    }
    // dead-end fix: every current node must have >=1 child
    for (const node of cur) if (node.next.length === 0) {
      const target = rng.pick(nxt);
      node.next.push(target.col);
      parents.get(target.col).push(node.col);
    }
  }
  return grid;
}

export function reachableFrom(grid, row, col) {
  if (row < 0) return grid[0].map((n, i) => ({ row: 0, col: i }));
  const node = grid[row][col];
  return node.next.map(c => ({ row: row + 1, col: c }));
}
