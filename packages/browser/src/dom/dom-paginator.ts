import type { PaginationPlan, ResolvedPageConfig } from '@breakflow/core';

export function constructPaginatedDOM(
  sandboxRoot: HTMLElement,
  plan: PaginationPlan,
  pageConfig: ResolvedPageConfig,
  doc: Document
): HTMLElement {
  const outputContainer = doc.createElement('div');
  outputContainer.className = 'breakflow-paginated-root';

  for (const pageInfo of plan.pages) {
    const pageEl = doc.createElement('div');
    pageEl.className = 'breakflow-page';
    pageEl.setAttribute('data-page-number', String(pageInfo.pageNumber));
    pageEl.style.width = pageConfig.width;
    pageEl.style.height = pageConfig.height;
    pageEl.style.boxSizing = 'border-box';

    const contentEl = doc.createElement('div');
    contentEl.className = 'breakflow-page-content';
    contentEl.setAttribute('data-page-content', String(pageInfo.pageNumber));
    contentEl.style.boxSizing = 'border-box';
    contentEl.style.paddingTop = pageConfig.margin.top;
    contentEl.style.paddingRight = pageConfig.margin.right;
    contentEl.style.paddingBottom = pageConfig.margin.bottom;
    contentEl.style.paddingLeft = pageConfig.margin.left;

    for (const item of pageInfo.items) {
      const sourceEl = sandboxRoot.querySelector(`[data-breakflow-node-id="${item.nodeId}"]`) as HTMLElement | null;
      if (!sourceEl) continue;

      if (item.tableSplit?.isSplit) {
        // Construct table slice
        const tableSlice = createTableSlice(sourceEl, item.tableSplit, doc);
        contentEl.appendChild(tableSlice);
      } else {
        const clonedNode = sourceEl.cloneNode(true) as HTMLElement;
        contentEl.appendChild(clonedNode);
      }
    }

    pageEl.appendChild(contentEl);
    outputContainer.appendChild(pageEl);
  }

  return outputContainer;
}

function createTableSlice(
  originalTable: HTMLElement,
  tableSplit: { startRowIndex: number; endRowIndex: number; repeatsHeader: boolean },
  doc: Document
): HTMLElement {
  const tableClone = originalTable.cloneNode(false) as HTMLElement;
  tableClone.classList.add('breakflow-table-slice');
  tableClone.style.tableLayout = 'fixed';

  // 1. Capture and preserve column widths from original table headers or first row cells
  const colgroup = doc.createElement('colgroup');
  const sampleRow = originalTable.querySelector('tr');
  if (sampleRow) {
    const cells = Array.from(sampleRow.children) as HTMLElement[];
    for (const cell of cells) {
      const col = doc.createElement('col');
      const width = cell.getBoundingClientRect().width;
      if (width > 0) {
        col.style.width = `${Math.round(width)}px`;
      }
      colgroup.appendChild(col);
    }
    tableClone.appendChild(colgroup);
  }

  // 2. Repeat <thead> if configured
  const thead = originalTable.querySelector('thead');
  if (thead && (tableSplit.repeatsHeader || tableSplit.startRowIndex === 0)) {
    tableClone.appendChild(thead.cloneNode(true));
  }

  // 3. Slice <tbody> rows
  const allRows = Array.from(originalTable.querySelectorAll('tbody tr, table > tr')) as HTMLElement[];
  // If no tbody was present and rows were direct children or in tbody
  const tbody = doc.createElement('tbody');

  for (let i = tableSplit.startRowIndex; i <= tableSplit.endRowIndex && i < allRows.length; i++) {
    const row = allRows[i];
    if (row) {
      tbody.appendChild(row.cloneNode(true));
    }
  }

  tableClone.appendChild(tbody);
  return tableClone;
}
