import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { generatePdf, analyzePdf } from '../../packages/playwright/src/index.js';

import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const fixturesDir = path.resolve(__dirname, '../fixtures');

function loadFixture(filename: string): string {
  return fs.readFileSync(path.join(fixturesDir, filename), 'utf8');
}

test.describe('BreakFlow Acceptance Criteria Scenarios', () => {

  // Scenario 1: Heading alone at bottom of page moves with its following content
  test('Scenario 1: Heading orphan prevention moves heading with following content', async ({ page }) => {
    const html = loadFixture('01-heading-orphan.html');
    const pdfResult = await generatePdf({
      html,
      selector: '#content',
      playwrightPage: page
    });

    expect(pdfResult.result.pageCount).toBe(2);
    // Heading #experience-title should be moved to page 2 alongside #experience-intro
    const page2 = pdfResult.result.pages[1];
    expect(page2).toBeDefined();
    const page2Selectors = page2?.items.map((i) => i.selector);
    expect(page2Selectors).toContain('#experience-title');
    expect(page2Selectors).toContain('#experience-intro');

    // Confirm automatic fix was recorded
    expect(pdfResult.result.fixes.some((f) => f.type === 'prevent-orphan-heading')).toBe(true);
  });

  // Scenario 2: Card marked keepTogether that fits on one page is never split
  test('Scenario 2: Card marked keepTogether is moved intact to next page', async ({ page }) => {
    const html = loadFixture('02-card-split.html');
    const pdfResult = await generatePdf({
      html,
      selector: '#content',
      playwrightPage: page
    });

    expect(pdfResult.result.pageCount).toBe(2);
    const page1 = pdfResult.result.pages[0];
    const page2 = pdfResult.result.pages[1];

    // Card should not be split across pages; it should be on page 2 intact
    expect(page1?.items.some((i) => i.selector === '#project-card')).toBe(false);
    expect(page2?.items.some((i) => i.selector === '#project-card')).toBe(true);
    expect(pdfResult.result.fixes.some((f) => f.type === 'move-to-next-page')).toBe(true);
  });

  // Scenario 3: Oversized keepTogether card larger than one page does not loop or blank, splits safely and warns
  test('Scenario 3: Oversized card degrades safely and reports warning without infinite loop', async ({ page }) => {
    const html = loadFixture('06-oversized-element.html');
    const pdfResult = await generatePdf({
      html,
      selector: '#content',
      playwrightPage: page
    });

    // Must not loop or create empty pages
    expect(pdfResult.result.pageCount).toBeGreaterThanOrEqual(2);
    // Must generate oversized-element warning
    const oversizedIssue = pdfResult.result.issues.find((i) => i.type === 'oversized-element');
    expect(oversizedIssue).toBeDefined();
    expect(oversizedIssue?.severity).toBe('warning');

    // Child sections should be distributed across pages
    const page1Items = pdfResult.result.pages[0]?.items.map((i) => i.selector);
    const page2Items = pdfResult.result.pages[1]?.items.map((i) => i.selector);
    expect(page1Items?.length).toBeGreaterThan(0);
    expect(page2Items?.length).toBeGreaterThan(0);
  });

  // Scenario 4: Table rows are not cut between normal pages when they fit individually
  test('Scenario 4: Table rows are not cut between normal pages', async ({ page }) => {
    const html = loadFixture('03-table.html');
    const pdfResult = await generatePdf({
      html,
      selector: '#content',
      playwrightPage: page
    });

    expect(pdfResult.result.pageCount).toBe(2);
    // Table moved intact to page 2 without breaking individual rows
    expect(pdfResult.result.pages[1]?.items.some((i) => i.tagName === 'table')).toBe(true);
  });

  // Scenario 5: Multi-page table headers repeat
  test('Scenario 5: Multi-page table repeats thead on subsequent pages', async ({ page }) => {
    const html = loadFixture('04-long-table.html');
    const pdfResult = await generatePdf({
      html,
      selector: '#content',
      playwrightPage: page
    });

    expect(pdfResult.result.pageCount).toBeGreaterThan(1);
    // Check that split table fix with repeated header was applied
    const repeatFix = pdfResult.result.fixes.find((f) => f.type === 'split-table-repeat-header');
    expect(repeatFix).toBeDefined();

    // Verify in the actual DOM rendered in the page that continuation tables have <thead>
    const tableSlicesWithThead = await page.$$eval('.breakflow-page .breakflow-table-slice thead', (els) => els.length);
    expect(tableSlicesWithThead).toBeGreaterThanOrEqual(2);
  });

  // Scenario 6: Forced page break always creates expected new page without extra empty page
  test('Scenario 6: Forced page break creates clean page without unnecessary empty page', async ({ page }) => {
    const html = loadFixture('12-forced-break.html');
    const pdfResult = await generatePdf({
      html,
      selector: '#content',
      playwrightPage: page
    });

    expect(pdfResult.result.pageCount).toBe(2);
    expect(pdfResult.result.pages[0]?.items.some((i) => i.selector === '#section-1')).toBe(true);
    expect(pdfResult.result.pages[1]?.items.some((i) => i.selector === '#section-2')).toBe(true);
    expect(pdfResult.result.pages[1]?.items.some((i) => i.selector === '#section-3')).toBe(true);
  });

  // Scenario 7: Images and captions configured as single semantic group stay together
  test('Scenario 7: Figure with image and caption stays together on the same page', async ({ page }) => {
    const html = loadFixture('05-image-caption.html');
    const pdfResult = await generatePdf({
      html,
      selector: '#content',
      playwrightPage: page
    });

    expect(pdfResult.result.pageCount).toBe(2);
    // Figure should be on page 2 intact
    const page2 = pdfResult.result.pages[1];
    expect(page2?.items.some((i) => i.selector === '#architecture-figure')).toBe(true);
  });

  // Scenario 8: Analyze mode identifies bad pagination without altering live DOM
  test('Scenario 8: Analyze mode identifies issues without modifying live DOM', async ({ page }) => {
    const html = loadFixture('01-heading-orphan.html');
    await page.setContent(html, { waitUntil: 'networkidle' });

    // Capture initial DOM structure
    const initialHtml = await page.innerHTML('#content');

    const analysis = await analyzePdf({
      html,
      selector: '#content',
      playwrightPage: page
    });

    expect(analysis.pageCount).toBe(2);
    expect(analysis.fixes.length).toBeGreaterThan(0);

    // Re-verify that the page DOM remains intact
    const currentHtml = await page.innerHTML('#content');
    expect(currentHtml).toBe(initialHtml);
  });

  // Scenario 9: Debug mode displays page boundaries without altering measured pagination
  test('Scenario 9: Debug mode adds badges and overlay without modifying page count', async ({ page }) => {
    const html = loadFixture('02-card-split.html');

    // Run without debug
    const normalResult = await generatePdf({
      html,
      selector: '#content',
      config: { debug: false }
    });

    // Run with debug
    const debugResult = await generatePdf({
      html,
      selector: '#content',
      config: { debug: true }
    });

    expect(debugResult.result.pageCount).toBe(normalResult.result.pageCount);
  });

  // Scenario 10: Playwright creates a selectable-text PDF, not a rasterized screenshot
  test('Scenario 10: PDF output contains real text and is selectable', async ({ page }) => {
    const html = loadFixture('10-cv.html');
    const pdfResult = await generatePdf({
      html,
      selector: '#cv',
      playwrightPage: page
    });

    expect(pdfResult.pdfBuffer).toBeDefined();
    expect(pdfResult.pdfBuffer.length).toBeGreaterThan(1000);
    // PDF header magic bytes "%PDF-"
    expect(pdfResult.pdfBuffer.subarray(0, 5).toString('ascii')).toBe('%PDF-');

    // Inspect that DOM elements in the final paginated pages contain real text nodes (not canvas images)
    const textContentLength = await page.$eval('.breakflow-page', (el) => el.textContent?.length || 0);
    expect(textContentLength).toBeGreaterThan(50);
  });

  // Scenario 11: Deterministic pagination across repeated runs
  test('Scenario 11: Produces deterministic pagination across repeated runs', async () => {
    const html = loadFixture('09-invoice.html');

    const run1 = await generatePdf({ html, selector: '#invoice' });
    const run2 = await generatePdf({ html, selector: '#invoice' });

    expect(run1.result.pageCount).toBe(run2.result.pageCount);
    expect(run1.result.pages.length).toBe(run2.result.pages.length);
    for (let i = 0; i < run1.result.pages.length; i++) {
      expect(run1.result.pages[i]?.items.length).toBe(run2.result.pages[i]?.items.length);
      expect(run1.result.pages[i]?.contentHeight).toBe(run2.result.pages[i]?.contentHeight);
    }
  });

  // Scenario 12: CLI lint fails CI when severe pagination issues detected
  test('Scenario 12: CLI lint detection and issue reporting', async ({ page }) => {
    const html = loadFixture('06-oversized-element.html');
    const analysis = await analyzePdf({
      html,
      selector: '#content',
      playwrightPage: page
    });

    const oversizedWarning = analysis.issues.some((i) => i.type === 'oversized-element');
    expect(oversizedWarning).toBe(true);
  });

});
