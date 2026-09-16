import type { LayoutNode } from './node.js';

export interface BreakPenaltyFlags {
  /** A heading left orphan at bottom of page without sufficient subsequent content */
  orphanHeading: boolean;
  /** A single line or small fragment left alone */
  widow: boolean;
  /** A keepTogether constraint was broken */
  keepTogetherViolation: boolean;
  /** A keepWithNext constraint was broken */
  keepWithNextViolation: boolean;
  /** A table row was sliced midway */
  tableRowSplit: boolean;
  /** Element is larger than an entire page and cannot fit on a single page */
  oversizedElement: boolean;
}

export type BreakCandidateType =
  | 'before-node'
  | 'after-node'
  | 'inside-node'
  | 'table-row-break'
  | 'forced-break';

export interface BreakCandidate {
  /** Unique ID for candidate evaluation */
  id: string;

  /** Index among candidates for current page */
  index: number;

  /** Candidate kind */
  type: BreakCandidateType;

  /** Content height accumulated if breaking at this point */
  contentHeight: number;

  /** Remaining space on the current page if breaking at this point */
  remainingSpace: number;

  /** Whether this break is explicitly forced by breakBefore or breakAfter */
  forced: boolean;

  /** The node immediately preceding the break (if any) */
  precedingNode?: LayoutNode;

  /** The node immediately following the break (if any) */
  followingNode?: LayoutNode;

  /** If breaking inside a container (e.g. table or oversized card), the parent node */
  parentNode?: LayoutNode;

  /** If breaking inside a table, index of the row */
  splitRowIndex?: number;

  /** Evaluated penalty flags */
  penalties: BreakPenaltyFlags;

  /** Calculated composite cost (lower is better; forced breaks are negative infinity) */
  cost: number;
}
