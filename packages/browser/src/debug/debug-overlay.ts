import type { PaginationResult, PageInfo } from '@breakflow/core';

export function attachDebugOverlay(
  paginatedRoot: HTMLElement,
  result: PaginationResult,
  doc: Document
): HTMLElement {
  const overlayRoot = doc.createElement('div');
  overlayRoot.className = 'breakflow-debug-overlay-root';
  overlayRoot.setAttribute('data-breakflow-debug', 'true');
  overlayRoot.style.position = 'absolute';
  overlayRoot.style.top = '0';
  overlayRoot.style.left = '0';
  overlayRoot.style.width = '100%';
  overlayRoot.style.height = '100%';
  overlayRoot.style.pointerEvents = 'none';
  overlayRoot.style.zIndex = '99999';

  const pages = paginatedRoot.querySelectorAll<HTMLElement>('.breakflow-page');

  pages.forEach((pageEl, idx) => {
    const pageInfo = result.pages[idx];
    if (!pageInfo) return;

    // Page Boundary Indicator badge
    const badge = doc.createElement('div');
    badge.className = 'breakflow-debug-page-badge';
    badge.textContent = `Page ${pageInfo.pageNumber} / ${result.pageCount} [Used: ${Math.round(pageInfo.contentHeight)}px / ${Math.round(pageInfo.availableHeight)}px]`;
    badge.style.position = 'absolute';
    badge.style.top = '4px';
    badge.style.right = '4px';
    badge.style.background = '#0f172a';
    badge.style.color = '#38bdf8';
    badge.style.fontSize = '10px';
    badge.style.fontFamily = 'monospace';
    badge.style.padding = '3px 7px';
    badge.style.borderRadius = '4px';
    badge.style.opacity = '0.9';
    badge.style.zIndex = '1000';
    pageEl.appendChild(badge);

    // Outline page boundary
    pageEl.style.outline = '1px dashed #64748b';
    pageEl.style.outlineOffset = '-1px';

    // Highlight fixes/issues on elements within this page
    const contentEl = pageEl.querySelector('.breakflow-page-content');
    if (contentEl) {
      for (const fix of result.fixes) {
        if (fix.toPage === pageInfo.pageNumber) {
          const target = contentEl.querySelector(fix.selector) as HTMLElement | null;
          if (target) {
            target.style.outline = '2px solid #22c55e';
            target.title = `BreakFlow Fix: ${fix.description}`;
          }
        }
      }

      for (const issue of result.issues) {
        if (issue.page === pageInfo.pageNumber && issue.selector) {
          const target = contentEl.querySelector(issue.selector) as HTMLElement | null;
          if (target) {
            target.style.outline = '2px solid #ef4444';
            target.title = `BreakFlow Issue [${issue.type}]: ${issue.message}`;
          }
        }
      }
    }
  });

  paginatedRoot.appendChild(overlayRoot);
  return overlayRoot;
}
