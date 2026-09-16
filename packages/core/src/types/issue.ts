export type PaginationIssueType =
  | 'orphan-heading'
  | 'widow'
  | 'split-element'
  | 'split-table-row'
  | 'oversized-element'
  | 'blank-page'
  | 'overflow'
  | 'asset-timeout'
  | 'unsupported-layout';

export type IssueSeverity = 'info' | 'warning' | 'error';

export interface PaginationIssue {
  /** Strongly typed issue identifier */
  type: PaginationIssueType;

  /** Issue severity level */
  severity: IssueSeverity;

  /** Page number where issue was detected (1-indexed) */
  page?: number;

  /** Relevant DOM or layout selector */
  selector?: string;

  /** Human-readable explanation */
  message: string;

  /** Additional non-DOM debugging metadata */
  details?: Record<string, unknown>;
}

export type AppliedFixType =
  | 'move-to-next-page'
  | 'split-table-repeat-header'
  | 'split-oversized-element'
  | 'prevent-orphan-heading'
  | 'insert-page-break'
  | 'remove-empty-page';

export interface AppliedFix {
  /** Type of correction applied */
  type: AppliedFixType;

  /** Relevant element selector */
  selector: string;

  /** Source page (1-indexed) */
  fromPage?: number;

  /** Target page (1-indexed) */
  toPage?: number;

  /** Human-readable explanation of the fix */
  description: string;

  /** Technical details */
  details?: Record<string, unknown>;
}
