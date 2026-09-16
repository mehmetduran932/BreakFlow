import type { LayoutNode } from './node.js';
import type { PaginationIssue, AppliedFix } from './issue.js';

export interface PaginationMetrics {
  preparationMs: number;
  measurementMs: number;
  planningMs: number;
  renderingMs: number;
  totalMs: number;
  measuredNodes: number;
  pages: number;
}

export interface PageContentItem {
  nodeId: string;
  selector: string;
  tagName: string;
  bounds: {
    top: number;
    bottom: number;
    width: number;
    height: number;
  };
  isPartial?: boolean;
  tableSplit?: {
    isSplit: boolean;
    startRowIndex: number;
    endRowIndex: number;
    repeatsHeader: boolean;
  };
}

export interface PageInfo {
  pageNumber: number;
  contentHeight: number;
  availableHeight: number;
  remainingSpace: number;
  items: PageContentItem[];
  hasForcedBreak: boolean;
  isOversizedContinuation?: boolean;
}

export interface PaginationPlan {
  pages: PageInfo[];
  issues: PaginationIssue[];
  fixes: AppliedFix[];
}

export interface PaginationResult {
  /** Total number of generated pages */
  pageCount: number;

  /** Metadata for each page */
  pages: PageInfo[];

  /** Identified pagination issues */
  issues: PaginationIssue[];

  /** Automatic fixes applied by the engine */
  fixes: AppliedFix[];

  /** Timing and diagnostic metrics */
  metrics: PaginationMetrics;
}
