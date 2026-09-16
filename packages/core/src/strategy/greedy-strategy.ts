import type {
  PaginationInput,
  PaginationStrategy
} from '../types/strategy.js';
import type {
  PageInfo,
  PageContentItem,
  PaginationPlan
} from '../types/result.js';
import type { PaginationIssue, AppliedFix } from '../types/issue.js';
import type { LayoutNode } from '../types/node.js';
import { ScoringEngine } from '../scoring/scoring-engine.js';
import { planTablePagination } from '../table/table-split-planner.js';

export class GreedyScoredStrategy implements PaginationStrategy {
  public readonly name = 'greedy-scored';

  public paginate(input: PaginationInput): PaginationPlan {
    const { nodes, pageContentHeight, config } = input;
    const scoring = new ScoringEngine(config.penalties);

    const pages: PageInfo[] = [];
    const issues: PaginationIssue[] = [];
    const fixes: AppliedFix[] = [];

    let currentPageNumber = 1;
    let currentPageItems: PageContentItem[] = [];
    let currentHeight = 0;
    let iterationCount = 0;

    const finalizePage = (hasForcedBreak = false, isOversizedContinuation = false) => {
      if (currentPageItems.length === 0 && !hasForcedBreak) {
        return;
      }
      pages.push({
        pageNumber: currentPageNumber++,
        contentHeight: currentHeight,
        availableHeight: pageContentHeight,
        remainingSpace: Math.max(0, pageContentHeight - currentHeight),
        items: [...currentPageItems],
        hasForcedBreak,
        isOversizedContinuation
      });
      currentPageItems = [];
      currentHeight = 0;
    };

    let i = 0;
    while (i < nodes.length) {
      iterationCount++;
      if (iterationCount > config.maxIterations) {
        issues.push({
          type: 'overflow',
          severity: 'error',
          message: `Pagination loop terminated: exceeded maximum iterations (${config.maxIterations}).`
        });
        break;
      }
      if (pages.length >= config.maxPages) {
        issues.push({
          type: 'overflow',
          severity: 'error',
          message: `Pagination terminated: reached maximum page limit (${config.maxPages}).`
        });
        break;
      }

      const node = nodes[i]!;
      const nodeHeight = node.bounds.height;
      const nextNode = i + 1 < nodes.length ? nodes[i + 1] : undefined;

      // 1. Check forced breakBefore
      if (node.rules.breakBefore && currentPageItems.length > 0) {
        fixes.push({
          type: 'insert-page-break',
          selector: node.selector,
          description: `Applied breakBefore on ${node.selector}`,
          toPage: currentPageNumber + 1
        });
        finalizePage(true);
      }

      // Check if node is a heading or has keepWithNext
      const isHeading =
        node.type === 'heading' ||
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(node.tagName.toLowerCase());
      const needsNext = node.rules.keepWithNext || isHeading;

      // 2. Table handling
      if (node.type === 'table' || node.tagName.toLowerCase() === 'table') {
        const availableHeight = currentPageItems.length === 0 ? pageContentHeight : Math.max(0, pageContentHeight - currentHeight);

        // If table fits completely on current page
        if (nodeHeight <= availableHeight) {
          currentPageItems.push({
            nodeId: node.id,
            selector: node.selector,
            tagName: node.tagName,
            bounds: { ...node.bounds }
          });
          currentHeight += nodeHeight;
          i++;
          continue;
        }

        // If table doesn't fit on current page:
        // Check if moving whole table to a fresh page fits it completely
        if (currentPageItems.length > 0 && nodeHeight <= pageContentHeight) {
          // It fits on a fresh page! Move it.
          fixes.push({
            type: 'move-to-next-page',
            selector: node.selector,
            fromPage: currentPageNumber,
            toPage: currentPageNumber + 1,
            description: `Moved table to page ${currentPageNumber + 1} to keep it intact`
          });
          finalizePage(false);
          // Will be processed on fresh page in next iteration
          continue;
        }

        // Table is taller than available space (and may be taller than an entire page).
        // If current page already has items and remaining space is small (< 25% of page),
        // it's cleaner to start table on fresh page.
        if (currentPageItems.length > 0 && availableHeight < pageContentHeight * 0.25) {
          finalizePage(false);
          continue;
        }

        // Plan table split across pages
        const tablePlan = planTablePagination(
          node,
          availableHeight,
          pageContentHeight,
          config.table.repeatHeader,
          config.table.preventRowSplit
        );

        issues.push(...tablePlan.issues);
        fixes.push(...tablePlan.fixes);

        // Distribute slices
        for (let s = 0; s < tablePlan.slices.length; s++) {
          const slice = tablePlan.slices[s]!;
          if (s > 0) {
            finalizePage(false);
          }
          currentPageItems.push({
            nodeId: node.id,
            selector: node.selector,
            tagName: node.tagName,
            bounds: {
              ...node.bounds,
              height: slice.sliceHeight
            },
            isPartial: tablePlan.slices.length > 1,
            tableSplit: {
              isSplit: tablePlan.slices.length > 1,
              startRowIndex: slice.startRowIndex,
              endRowIndex: slice.endRowIndex,
              repeatsHeader: slice.repeatsHeader
            }
          });
          currentHeight += slice.sliceHeight;
        }

        i++;
        continue;
      }

      // 3. Oversized element handling (element height > pageContentHeight)
      if (nodeHeight > pageContentHeight) {
        // Report warning
        issues.push({
          type: 'oversized-element',
          severity: 'warning',
          selector: node.selector,
          page: currentPageNumber,
          message: `Element ${node.selector} height (${Math.round(nodeHeight)}px) exceeds page content height (${Math.round(pageContentHeight)}px). Degraded keepTogether.`,
          details: { measuredHeight: nodeHeight, availablePageHeight: pageContentHeight }
        });

        // If current page already has content, start the oversized element on a fresh page
        if (currentPageItems.length > 0) {
          finalizePage(false);
        }

        // If the oversized element has child blocks, paginate its children
        if (node.children.length > 0) {
          fixes.push({
            type: 'split-oversized-element',
            selector: node.selector,
            description: `Split oversized element ${node.selector} across pages by children`
          });

          // Process children through internal greedy loop
          for (const child of node.children) {
            if (currentHeight + child.bounds.height > pageContentHeight && currentPageItems.length > 0) {
              finalizePage(false, true);
            }
            currentPageItems.push({
              nodeId: child.id,
              selector: child.selector,
              tagName: child.tagName,
              bounds: { ...child.bounds }
            });
            currentHeight += child.bounds.height;
          }
        } else {
          // Atomic oversized element (e.g. huge image or single block)
          currentPageItems.push({
            nodeId: node.id,
            selector: node.selector,
            tagName: node.tagName,
            bounds: { ...node.bounds }
          });
          currentHeight += nodeHeight;
          finalizePage(false);
        }

        i++;
        continue;
      }

      // 4. Normal elements fitting check
      const remainingOnPage = pageContentHeight - currentHeight;

      if (nodeHeight <= remainingOnPage) {
        // Element fits on current page.
        // Check keepWithNext (orphan heading check):
        // If node needs next element, does the next element also fit, or will this be left alone?
        if (needsNext && nextNode && currentPageItems.length > 0) {
          const nextHeight = nextNode.bounds.height;
          const roomForBoth = currentHeight + nodeHeight + nextHeight <= pageContentHeight;
          const nextCanFitOnFreshPage = nextHeight <= pageContentHeight;

          // If next element cannot fit on current page along with heading, but next element CAN fit on fresh page:
          if (!roomForBoth && nextCanFitOnFreshPage) {
            // Move heading to next page!
            fixes.push({
              type: 'prevent-orphan-heading',
              selector: node.selector,
              fromPage: currentPageNumber,
              toPage: currentPageNumber + 1,
              description: `Moved heading ${node.selector} to page ${currentPageNumber + 1} with subsequent content`
            });
            finalizePage(false);
            // Don't increment i; evaluate heading on fresh page
            continue;
          }
        }

        // Add node to current page
        currentPageItems.push({
          nodeId: node.id,
          selector: node.selector,
          tagName: node.tagName,
          bounds: { ...node.bounds }
        });
        currentHeight += nodeHeight;

        if (node.rules.breakAfter) {
          fixes.push({
            type: 'insert-page-break',
            selector: node.selector,
            description: `Applied breakAfter on ${node.selector}`,
            toPage: currentPageNumber + 1
          });
          finalizePage(true);
        }

        i++;
      } else {
        // Element does not fit in remaining space on current page
        if (currentPageItems.length > 0) {
          // Push current page and start fresh page for this element
          fixes.push({
            type: 'move-to-next-page',
            selector: node.selector,
            fromPage: currentPageNumber,
            toPage: currentPageNumber + 1,
            description: `Moved ${node.selector} to page ${currentPageNumber + 1} to avoid split`
          });
          finalizePage(false);
          // Don't increment i; retry node on fresh page
        } else {
          // Fresh page already, but still doesn't fit -> already handled by oversized above,
          // but guard against edge cases:
          currentPageItems.push({
            nodeId: node.id,
            selector: node.selector,
            tagName: node.tagName,
            bounds: { ...node.bounds }
          });
          currentHeight += nodeHeight;
          i++;
        }
      }
    }

    // Finalize last page
    finalizePage(false);

    // 5. Post-Pagination Validation
    for (let pIdx = 0; pIdx < pages.length; pIdx++) {
      const page = pages[pIdx]!;

      // Check overflow
      if (page.contentHeight > page.availableHeight + 2) {
        issues.push({
          type: 'overflow',
          severity: 'warning',
          page: page.pageNumber,
          message: `Page ${page.pageNumber} content height (${Math.round(page.contentHeight)}px) exceeds available height (${Math.round(page.availableHeight)}px).`
        });
      }

      // Check orphan heading (heading alone at bottom of page)
      if (page.items.length > 0) {
        const lastItem = page.items[page.items.length - 1]!;
        const isHeading =
          lastItem.tagName.toLowerCase().startsWith('h') &&
          ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(lastItem.tagName.toLowerCase());

        if (isHeading && pIdx < pages.length - 1) {
          issues.push({
            type: 'orphan-heading',
            severity: 'warning',
            page: page.pageNumber,
            selector: lastItem.selector,
            message: `Orphan heading detected at bottom of page ${page.pageNumber}: ${lastItem.selector}`
          });
        }
      }
    }

    return {
      pages,
      issues,
      fixes
    };
  }
}
