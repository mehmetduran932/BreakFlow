export type StandardPageFormat =
  | 'A3'
  | 'A4'
  | 'A5'
  | 'Letter'
  | 'Legal'
  | 'Tabloid';

export interface PageDimensions {
  /** Width in millimeters */
  widthMm: number;
  /** Height in millimeters */
  heightMm: number;
}

export const STANDARD_PAGE_SIZES: Record<StandardPageFormat, PageDimensions> = {
  A3: { widthMm: 297, heightMm: 420 },
  A4: { widthMm: 210, heightMm: 297 },
  A5: { widthMm: 148, heightMm: 210 },
  Letter: { widthMm: 215.9, heightMm: 279.4 },
  Legal: { widthMm: 215.9, heightMm: 355.6 },
  Tabloid: { widthMm: 279.4, heightMm: 431.8 }
};

export interface PageMargin {
  top?: string | number;
  right?: string | number;
  bottom?: string | number;
  left?: string | number;
}

export type PageOrientation = 'portrait' | 'landscape';

export interface PageConfig {
  /** Standard format name or explicit width/height dimensions */
  format?: StandardPageFormat;
  /** Explicit width (e.g. '210mm', '8.5in', '800px') */
  width?: string | number;
  /** Explicit height (e.g. '297mm', '11in', '1100px') */
  height?: string | number;
  /** Margins around content (top, right, bottom, left) */
  margin?: string | number | PageMargin;
  /** Orientation (default: 'portrait') */
  orientation?: PageOrientation;
}

export interface ResolvedPageMargin {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

export interface ResolvedPageConfig {
  format?: StandardPageFormat;
  width: string;
  height: string;
  margin: ResolvedPageMargin;
  orientation: PageOrientation;
}
