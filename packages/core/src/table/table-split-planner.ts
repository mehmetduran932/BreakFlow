import type { LayoutNode } from '../types/node.js';
import type { PaginationIssue, AppliedFix } from '../types/issue.js';

export interface TableSlicePlan {
  startRowIndex: number;
  endRowIndex: number; // inclusive
  repeatsHeader: boolean;
  headerHeight: number;
  sliceHeight: number;
  isOversizedRow: boolean;
}

export interface TablePaginationPlan {
  slices: TableSlicePlan[];
  issues: PaginationIssue[];
  fixes: AppliedFix[];
}

export function planTablePagination(
  tableNode: LayoutNode,
  availableHeightOnFirstPage: number,
  fullPageContentHeight: number,
  repeatHeader = true,
  preventRowSplit = true
): TablePaginationPlan {
  const issues: PaginationIssue[] = [];
  const fixes: AppliedFix[] = [];
  const slices: TableSlicePlan[] = [];

  // Find header node and rows
  let headerHeight = 0;
  const headerNode = tableNode.children.find((c) => c.type === 'table-head' || c.tagName.toLowerCase() === 'thead');
  if (headerNode) {
    headerHeight = headerNode.bounds.height;
  }

  // Find all row nodes
  const rows: LayoutNode[] = [];
  function collectRows(node: LayoutNode) {
    if (node.type === 'table-row' || node.tagName.toLowerCase() === 'tr') {
      // Don't include header rows in the data row list
      if (!headerNode || !headerNode.children.includes(node)) {
        rows.push(node);
      }
    } else {
      for (const child of node.children) {
        collectRows(child);
      }
    }
  }

  collectRows(tableNode);

  if (rows.length === 0) {
    // Empty or row-less table
    slices.push({
      startRowIndex: 0,
      endRowIndex: -1,
      repeatsHeader: false,
      headerHeight,
      sliceHeight: tableNode.bounds.height,
      isOversizedRow: false
    });
    return { slices, issues, fixes };
  }

  let currentRowIdx = 0;
  let isFirstSlice = true;

  while (currentRowIdx < rows.length) {
    const availableHeight = isFirstSlice ? availableHeightOnFirstPage : fullPageContentHeight;
    const effectiveHeaderHeight = (!isFirstSlice && repeatHeader) ? headerHeight : (isFirstSlice ? headerHeight : 0);
    const availableForRows = availableHeight - effectiveHeaderHeight;

    let accumulatedHeight = 0;
    let sliceStartIdx = currentRowIdx;
    let sliceEndIdx = currentRowIdx;
    let sliceHasAtLeastOneRow = false;

    while (currentRowIdx < rows.length) {
      const row = rows[currentRowIdx]!;
      const rowHeight = row.bounds.height;

      // Check for oversized row
      if (rowHeight > fullPageContentHeight) {
        issues.push({
          type: 'oversized-element',
          severity: 'warning',
          selector: row.selector,
          message: `Table row height (${Math.round(rowHeight)}px) exceeds available page height (${Math.round(fullPageContentHeight)}px).`,
          details: { rowHeight, availableHeight: fullPageContentHeight }
        });
      }

      if (accumulatedHeight + rowHeight <= availableForRows || !sliceHasAtLeastOneRow) {
        // Fits in this slice, or first row forced in slice to guarantee progress
        accumulatedHeight += rowHeight;
        sliceEndIdx = currentRowIdx;
        sliceHasAtLeastOneRow = true;
        currentRowIdx++;
      } else {
        // Row doesn't fit on this page, break here
        break;
      }
    }

    const repeats = !isFirstSlice && repeatHeader && headerHeight > 0;
    slices.push({
      startRowIndex: sliceStartIdx,
      endRowIndex: sliceEndIdx,
      repeatsHeader: repeats,
      headerHeight: repeats ? headerHeight : 0,
      sliceHeight: accumulatedHeight + (repeats ? headerHeight : (isFirstSlice ? headerHeight : 0)),
      isOversizedRow: false
    });

    if (repeats) {
      fixes.push({
        type: 'split-table-repeat-header',
        selector: tableNode.selector,
        description: `Split table and repeated <thead> on continuation page for rows ${sliceStartIdx + 1}..${sliceEndIdx + 1}`
      });
    }

    isFirstSlice = false;
  }

  return { slices, issues, fixes };
}
