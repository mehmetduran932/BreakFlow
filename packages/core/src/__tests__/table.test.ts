import { describe, it, expect } from 'vitest';
import { planTablePagination } from '../table/table-split-planner.js';
import type { LayoutNode } from '../types/node.js';

describe('TableSplitPlanner', () => {
  const createRow = (id: string, height = 40): LayoutNode => ({
    id,
    selector: `tr#${id}`,
    tagName: 'tr',
    type: 'table-row',
    bounds: { top: 0, bottom: height, left: 0, right: 500, width: 500, height },
    breakable: false,
    rules: { keepTogether: true, keepWithNext: false, breakBefore: false, breakAfter: false },
    children: []
  });

  const createTable = (headerHeight = 50, rowHeights: number[]): LayoutNode => {
    const headerNode: LayoutNode = {
      id: 'thead-1',
      selector: 'thead',
      tagName: 'thead',
      type: 'table-head',
      bounds: { top: 0, bottom: headerHeight, left: 0, right: 500, width: 500, height: headerHeight },
      breakable: false,
      rules: { keepTogether: true, keepWithNext: false, breakBefore: false, breakAfter: false },
      children: [createRow('header-row', headerHeight)]
    };

    const rows = rowHeights.map((h, idx) => createRow(`row-${idx + 1}`, h));

    const totalHeight = headerHeight + rowHeights.reduce((a, b) => a + b, 0);

    return {
      id: 'table-1',
      selector: 'table.data-table',
      tagName: 'table',
      type: 'table',
      bounds: { top: 0, bottom: totalHeight, left: 0, right: 500, width: 500, height: totalHeight },
      breakable: true,
      rules: { keepTogether: false, keepWithNext: false, breakBefore: false, breakAfter: false, repeatHeader: true },
      children: [headerNode, ...rows]
    };
  };

  it('should not split table when it fits completely on available height', () => {
    const table = createTable(50, [40, 40, 40]); // total 170px
    const plan = planTablePagination(table, 500, 1000, true, true);

    expect(plan.slices.length).toBe(1);
    expect(plan.slices[0]?.startRowIndex).toBe(0);
    expect(plan.slices[0]?.endRowIndex).toBe(2);
    expect(plan.slices[0]?.repeatsHeader).toBe(false);
  });

  it('should split table across pages and repeat header on continuation slices', () => {
    // 20 rows of 50px = 1000px rows + 50px header = 1050px
    // First page available = 400px -> header (50px) + 7 rows (350px) = 400px (rows 0..6)
    // Continuation page available = 500px -> repeated header (50px) + 9 rows (450px) = 500px (rows 7..15)
    // Third page -> repeated header (50px) + remaining 4 rows (200px) = 250px (rows 16..19)
    const rowHeights = Array(20).fill(50);
    const table = createTable(50, rowHeights);

    const plan = planTablePagination(table, 400, 500, true, true);

    expect(plan.slices.length).toBe(3);
    // Slice 1: rows 0..6
    expect(plan.slices[0]?.startRowIndex).toBe(0);
    expect(plan.slices[0]?.endRowIndex).toBe(6);
    expect(plan.slices[0]?.repeatsHeader).toBe(false);

    // Slice 2: rows 7..15, repeated header
    expect(plan.slices[1]?.startRowIndex).toBe(7);
    expect(plan.slices[1]?.endRowIndex).toBe(15);
    expect(plan.slices[1]?.repeatsHeader).toBe(true);

    // Slice 3: rows 16..19, repeated header
    expect(plan.slices[2]?.startRowIndex).toBe(16);
    expect(plan.slices[2]?.endRowIndex).toBe(19);
    expect(plan.slices[2]?.repeatsHeader).toBe(true);
  });

  it('should detect oversized table row that exceeds page height', () => {
    // Page height = 500px. Row 2 is 600px tall.
    const table = createTable(50, [40, 600, 40]);
    const plan = planTablePagination(table, 500, 500, true, true);

    expect(plan.issues.some((i) => i.type === 'oversized-element')).toBe(true);
  });
});
