import type { LayoutNode } from './node.js';
import type { ResolvedBreakFlowConfig } from './config.js';
import type { PaginationPlan } from './result.js';

export interface PaginationInput {
  /** Root layout nodes to be paginated */
  nodes: LayoutNode[];

  /** Available printable content height per page in CSS pixels */
  pageContentHeight: number;

  /** Available printable content width per page in CSS pixels */
  pageContentWidth: number;

  /** Resolved engine configuration */
  config: ResolvedBreakFlowConfig;
}

export interface PaginationStrategy {
  /** Name of this strategy implementation */
  readonly name: string;

  /** Computes the pagination plan */
  paginate(input: PaginationInput): PaginationPlan;
}
