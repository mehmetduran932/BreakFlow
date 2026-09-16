import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { chromium, type Browser, type Page } from 'playwright';
import {
  type BreakFlowConfig,
  type PaginationResult,
  resolveConfig,
  RendererError
} from '@breakflow/core';
import type { GeneratePdfOptions, AnalyzePdfOptions, PdfResult } from './types.js';

let cachedBundleScript: string | null = null;

function getBrowserBundleScript(): string {
  if (cachedBundleScript) return cachedBundleScript;

  // Resolve path to @breakflow/browser/dist/index.global.js
  const currentDir = path.dirname(fileURLToPath(import.meta.url));
  const candidatePaths = [
    path.resolve(currentDir, '../../browser/dist/index.global.js'),
    path.resolve(currentDir, '../node_modules/@breakflow/browser/dist/index.global.js'),
    path.resolve(currentDir, '../../../node_modules/@breakflow/browser/dist/index.global.js')
  ];

  for (const candidate of candidatePaths) {
    if (fs.existsSync(candidate)) {
      cachedBundleScript = fs.readFileSync(candidate, 'utf8');
      return cachedBundleScript;
    }
  }

  throw new RendererError(
    'BreakFlow browser bundle (index.global.js) could not be located. Ensure @breakflow/browser is built.'
  );
}

export async function generatePdf(options: GeneratePdfOptions): Promise<PdfResult> {
  const {
    url,
    html,
    selector = 'body',
    output,
    page: pageProp,
    settleTimeoutMs = 200,
    headless = true
  } = options;

  if (!url && !html) {
    throw new RendererError('Either "url" or "html" must be provided to generatePdf.');
  }

  const rawConfig: BreakFlowConfig = {
    ...options.config,
    page: pageProp ?? options.config?.page
  };
  const resolved = resolveConfig(rawConfig);

  let browser: Browser | null = null;
  let page: Page = options.playwrightPage!;

  try {
    if (!page) {
      browser = await chromium.launch({ headless });
      page = await browser.newPage();
    }

    // 1. Navigate to target URL or HTML content
    if (url) {
      await page.goto(url, { waitUntil: 'networkidle' });
    } else if (html) {
      await page.setContent(html, { waitUntil: 'networkidle' });
    }

    // 2. Emulate Print Media
    await page.emulateMedia({ media: 'print' });

    // 3. Settle and font readiness
    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    if (settleTimeoutMs > 0) {
      await page.waitForTimeout(settleTimeoutMs);
    }

    // 4. Inject BreakFlow Browser Bundle
    const bundleScript = getBrowserBundleScript();
    await page.addScriptTag({ content: bundleScript });

    // 5. Run Pagination in Chromium context
    const paginationResult = await page.evaluate(
      async ({ sel, cfg }) => {
        const BreakFlow = (window as unknown as { BreakFlow: typeof import('@breakflow/browser') }).BreakFlow;
        if (!BreakFlow || !BreakFlow.createPaginator) {
          throw new Error('[BreakFlow] Failed to load BreakFlow engine into browser context.');
        }

        const paginator = BreakFlow.createPaginator(cfg);
        const res = await paginator.paginate(sel, {
          replaceOriginal: true,
          injectStyles: true
        });

        return {
          pageCount: res.pageCount,
          pages: res.pages,
          issues: res.issues,
          fixes: res.fixes,
          metrics: res.metrics
        };
      },
      { sel: selector, cfg: rawConfig }
    );

    // 6. Generate PDF via Chromium Print
    const pdfFormat = resolved.page.format ?? 'A4';
    const pdfBuffer = await page.pdf({
      path: output,
      format: pdfFormat,
      printBackground: true,
      margin: {
        top: '0px',
        bottom: '0px',
        left: '0px',
        right: '0px'
      }
    });

    return {
      pdfBuffer: Buffer.from(pdfBuffer),
      outputPath: output,
      result: paginationResult
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

export async function analyzePdf(options: AnalyzePdfOptions): Promise<PaginationResult> {
  const {
    url,
    html,
    selector = 'body',
    settleTimeoutMs = 200
  } = options;

  if (!url && !html) {
    throw new RendererError('Either "url" or "html" must be provided to analyzePdf.');
  }

  let browser: Browser | null = null;
  let page: Page = options.playwrightPage!;

  try {
    if (!page) {
      browser = await chromium.launch({ headless: true });
      page = await browser.newPage();
    }

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle' });
    } else if (html) {
      await page.setContent(html, { waitUntil: 'networkidle' });
    }

    await page.emulateMedia({ media: 'print' });

    await page.evaluate(async () => {
      if (document.fonts) {
        await document.fonts.ready;
      }
    });

    if (settleTimeoutMs > 0) {
      await page.waitForTimeout(settleTimeoutMs);
    }

    const bundleScript = getBrowserBundleScript();
    await page.addScriptTag({ content: bundleScript });

    const result = await page.evaluate(
      async ({ sel, cfg }) => {
        const BreakFlow = (window as unknown as { BreakFlow: typeof import('@breakflow/browser') }).BreakFlow;
        if (!BreakFlow || !BreakFlow.createPaginator) {
          throw new Error('[BreakFlow] Failed to load BreakFlow engine into browser context.');
        }

        const paginator = BreakFlow.createPaginator(cfg);
        const res = await paginator.analyze(sel);

        return {
          pageCount: res.pageCount,
          pages: res.pages,
          issues: res.issues,
          fixes: res.fixes,
          metrics: res.metrics
        };
      },
      { sel: selector, cfg: options.config }
    );

    return result;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
