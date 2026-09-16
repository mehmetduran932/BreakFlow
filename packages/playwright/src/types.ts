import type { BreakFlowConfig, PaginationResult } from '@breakflow/core';
import type { Page, Browser, BrowserContext } from 'playwright';

export interface GeneratePdfOptions {
  /** Target web page URL to load and paginate */
  url?: string;

  /** Direct raw HTML content to paginate */
  html?: string;

  /** CSS selector of the container element to paginate (default: 'body' or container) */
  selector?: string;

  /** File path where generated PDF will be written (optional) */
  output?: string;

  /** BreakFlow pagination configuration */
  config?: BreakFlowConfig;

  /** Page configuration shortcut */
  page?: BreakFlowConfig['page'];

  /** Existing Playwright Page instance (optional; if provided, uses this page) */
  playwrightPage?: Page;

  /** Existing Playwright Browser or Context (optional) */
  playwrightBrowser?: Browser | BrowserContext;

  /** Additional wait time in ms before measurement (for animations/fonts to settle, default: 200) */
  settleTimeoutMs?: number;

  /** Whether to run browser in headless mode (default: true) */
  headless?: boolean;
}

export interface AnalyzePdfOptions {
  url?: string;
  html?: string;
  selector?: string;
  config?: BreakFlowConfig;
  playwrightPage?: Page;
  settleTimeoutMs?: number;
}

export interface PdfResult {
  /** Raw PDF binary buffer */
  pdfBuffer: Buffer;

  /** Output file path if written */
  outputPath?: string;

  /** Diagnostic pagination result from BreakFlow engine */
  result: PaginationResult;
}
