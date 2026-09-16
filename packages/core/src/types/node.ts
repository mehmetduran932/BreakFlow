export type LayoutNodeType =
  | 'block'
  | 'heading'
  | 'paragraph'
  | 'table'
  | 'table-head'
  | 'table-body'
  | 'table-row'
  | 'image'
  | 'figure'
  | 'figcaption'
  | 'list'
  | 'list-item'
  | 'code'
  | 'unknown';

export interface LayoutBounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
}

export interface LayoutNodeRules {
  /** Prevent element from splitting across pages */
  keepTogether: boolean;
  /** Keep this element together with the following element (e.g. heading + intro paragraph) */
  keepWithNext: boolean;
  /** Force a page break before this element */
  breakBefore: boolean;
  /** Force a page break after this element */
  breakAfter: boolean;
  /** For table elements: whether table headers repeat when split */
  repeatHeader?: boolean;
  /** For table rows: prevent row from breaking */
  preventRowSplit?: boolean;
}

export interface LayoutNode {
  /** Unique stable identifier for this node in the layout tree */
  id: string;

  /** Human-readable selector or tag for diagnostics */
  selector: string;

  /** HTML tag name (lowercase, e.g. 'h2', 'div', 'tr') */
  tagName: string;

  /** Semantic type of the node */
  type: LayoutNodeType;

  /** Absolute bounding box relative to document content start (in CSS pixels) */
  bounds: LayoutBounds;

  /** Whether the element can legally be split between its children */
  breakable: boolean;

  /** Active pagination rules on this element */
  rules: LayoutNodeRules;

  /** Child layout nodes */
  children: LayoutNode[];

  /** Internal reference ID or metadata for mapping back to DOM without coupling */
  domRefId?: string;

  /** Arbitrary metadata (e.g. table cell counts, row indices) */
  metadata?: Record<string, unknown>;
}
