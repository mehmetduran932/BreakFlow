import type { PageConfig, ResolvedPageConfig } from './page.js';

export interface BreakFlowRulesConfig {
  /** Selectors for elements that should never split across pages */
  keepTogether?: string[];

  /** Selectors for elements that must stay on the same page as the following element */
  keepWithNext?: string[];

  /** Selectors for elements that must start on a fresh new page */
  breakBefore?: string[];

  /** Selectors for elements that force a page break immediately after */
  breakAfter?: string[];
}

export interface TableConfig {
  /** Repeat `<thead>` rows on subsequent pages when a table splits (default: true) */
  repeatHeader?: boolean;

  /** Prevent table rows `<tr>` from splitting midway across pages (default: true) */
  preventRowSplit?: boolean;
}

export interface PaginationPenaltiesConfig {
  /** Penalty for violating keepTogether constraint (default: 100_000) */
  keepTogether?: number;

  /** Penalty for splitting a table row midway (default: 100_000) */
  tableRowSplit?: number;

  /** Penalty for leaving a heading or keepWithNext without its next element (default: 30_000) */
  keepWithNext?: number;

  /** Penalty for an orphan heading at bottom of page (default: 20_000) */
  orphanHeading?: number;

  /** Penalty for widow lines or fragments (default: 10_000) */
  widow?: number;

  /** Penalty for oversized element needing safe degradation (default: 50_000) */
  oversizedElement?: number;

  /** Multiplier for remaining unused whitespace on the page (default: 1) */
  whitespace?: number;
}

export type LogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

export interface BreakFlowLogger {
  debug(msg: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

export interface BreakFlowConfig {
  /** Page dimensions and margins configuration */
  page?: PageConfig;

  /**
   * Automatically infer semantic rules:
   * - h1-h6: keepWithNext
   * - figure, img+figcaption: keepTogether
   * - table rows: preventRowSplit
   * - thead: repeatHeader
   * - pre, blockquote: prefer keepTogether
   */
  smartDefaults?: boolean;

  /** Custom selector-based pagination rules */
  rules?: BreakFlowRulesConfig;

  /** Table pagination settings */
  table?: TableConfig;

  /** Scoring engine penalties */
  penalties?: PaginationPenaltiesConfig;

  /** Max pagination iteration steps before halting (infinite loop guard, default: 500) */
  maxIterations?: number;

  /** Max allowed pages before aborting (default: 200) */
  maxPages?: number;

  /** Logging level */
  logLevel?: LogLevel;

  /** Custom logger instance */
  logger?: BreakFlowLogger;

  /** Enable visual debug overlay in browser */
  debug?: boolean;
}

export interface ResolvedPaginationPenalties {
  keepTogether: number;
  tableRowSplit: number;
  keepWithNext: number;
  orphanHeading: number;
  widow: number;
  oversizedElement: number;
  whitespace: number;
}

export interface ResolvedTableConfig {
  repeatHeader: boolean;
  preventRowSplit: boolean;
}

export interface ResolvedBreakFlowConfig {
  page: ResolvedPageConfig;
  smartDefaults: boolean;
  rules: Required<BreakFlowRulesConfig>;
  table: ResolvedTableConfig;
  penalties: ResolvedPaginationPenalties;
  maxIterations: number;
  maxPages: number;
  logLevel: LogLevel;
  debug: boolean;
}
