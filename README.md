# BreakFlow

> **Intelligent pagination for HTML and PDF.**  
> *Fix broken page breaks before they reach your PDF.*

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20App-000000?style=for-the-badge&logo=vercel)](https://temporary-fast-argon-5v5qgvo.vercel.app/)
[![NPM Version](https://img.shields.io/npm/v/%40breakflow%2Fcore?style=for-the-badge&color=CB3837&logo=npm)](https://www.npmjs.com/package/@breakflow/core)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

🚀 **[Try the Live Interactive Demo](https://temporary-fast-argon-5v5qgvo.vercel.app/)** *(Angular 22 + Signals + client-side jsPDF showcase)*

BreakFlow is a renderer-agnostic pagination engine that analyzes printable HTML, finds bad page breaks, and applies better pagination before the document reaches Chromium or another PDF renderer.

Think **ESLint for printable HTML**, combined with a **smart pagination engine**.

---

## What is BreakFlow?

HTML-to-PDF solutions frequently produce bad pagination:
* Headings remain alone at the bottom of a page (orphan headings).
* Cards and widgets are split awkwardly between pages.
* Table rows are sliced in half horizontally.
* Table continuation pages lack headers.
* Large components trigger infinite loops or blank pages.
* Browser-native pagination does not understand component semantics.

BreakFlow fixes these problems *before* the document is rasterized to PDF.

```
HTML / DOM ➔ Layout Measurement ➔ Intelligent Pagination ➔ Paginated DOM ➔ Chromium / PDF
```

## What BreakFlow is NOT

* **NOT another HTML-to-PDF library from scratch**: PDF rendering is an adapter. BreakFlow produces structured, printable DOM.
* **NOT a canvas screenshot tool**: Unlike `html2canvas`, BreakFlow preserves real vector text, fonts, links, and accessibility.
* **NOT destructive to live application DOM**: Works in an isolated sandbox. Frameworks like React, Angular, and Vue remain completely untouched.

---

## Installation

```bash
# npm (Standard Installation)
npm install @breakflow/core @breakflow/browser

# For Playwright PDF Generation
npm install -D @breakflow/playwright

# For Command Line Tools
npm install -g @breakflow/cli
```

Or using **pnpm** / **yarn**:
```bash
# pnpm
pnpm add @breakflow/core @breakflow/browser

# yarn
yarn add @breakflow/core @breakflow/browser
```

---

## Quick Start (Minimal Example)

In just 3 lines of code, turn any HTML element into clean, perfectly paginated pages:

```typescript
import { createPaginator } from '@breakflow/browser';

const paginator = createPaginator({ page: { format: 'A4', margin: '15mm' } });
const { element, pageCount } = await paginator.paginate('#invoice');

// `element` now contains structured, print-ready `.breakflow-page` elements!
document.body.appendChild(element);
```

---

## 🔌 Integration with External PDF Libraries

BreakFlow is **renderer-agnostic**. It is not a closed PDF generator; it is the **intelligent layout pre-processor** that solves pagination bugs *before* handoff to your favorite PDF library:

```
Your HTML ➔ [ BreakFlow: Measures, Avoids Orphan Headings, Repeats Tables ] ➔ External PDF Library / Print
```

### 1. Angular (22+) Component + `jsPDF` Integration

BreakFlow runs in an isolated sandbox, meaning your **Angular Signals**, bindings, and components remain 100% untouched.

```typescript
import { Component, signal, viewChild, ElementRef } from '@angular/core';
import { jsPDF } from 'jspdf';
import { createPaginator } from '@breakflow/browser';

@Component({
  selector: 'app-invoice-print',
  standalone: true,
  template: `
    <!-- Template to paginate -->
    <div #printableArea class="invoice">
      <h2>Invoice #{{ invoiceId() }}</h2>
      <table data-breakflow="table">
        <thead data-breakflow="repeat">
          <tr><th>Service</th><th>Hours</th><th>Rate</th></tr>
        </thead>
        <tbody>
          @for (item of items(); track item.id) {
            <tr><td>{{ item.title }}</td><td>{{ item.hours }}</td><td>\${{ item.rate }}</td></tr>
          }
        </tbody>
      </table>
    </div>

    <button (click)="exportPdf()" [disabled]="isExporting()">
      {{ isExporting() ? 'Generating PDF...' : 'Download PDF' }}
    </button>
  `
})
export class InvoicePrintComponent {
  readonly invoiceId = signal('INV-2026-001');
  readonly isExporting = signal(false);
  readonly items = signal([
    { id: '1', title: 'Architecture & System Design', hours: 40, rate: 150 },
    { id: '2', title: 'BreakFlow Layout Integration', hours: 25, rate: 180 },
    { id: '3', title: 'Automated Test Suite', hours: 20, rate: 140 }
  ]);

  // Query template reference
  readonly printableRef = viewChild<ElementRef<HTMLElement>>('printableArea');

  async exportPdf(): Promise<void> {
    this.isExporting.set(true);

    try {
      // 1. Paginate with BreakFlow (safe clone in isolated sandbox)
      const paginator = createPaginator({
        page: { format: 'A4', margin: '15mm' },
        table: { repeatHeader: true, preventRowSplit: true }
      });

      const { element } = await paginator.paginate(this.printableRef()!.nativeElement);

      // 2. Export with jsPDF (disable jsPDF naive slicing)
      const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
      await pdf.html(element, {
        callback: (doc) => doc.save(`invoice-${this.invoiceId()}.pdf`),
        autoPaging: false // ⚠️ IMPORTANT: BreakFlow controls the physical pages!
      });
    } finally {
      this.isExporting.set(false);
    }
  }
}
```

### 2. Client-Side with `jsPDF` (Vanilla / React / Vue)

Native `jsPDF.html()` slices elements blindly in half when transitioning across page boundaries. BreakFlow prevents this by calculating physical page boundaries in advance.

Set `autoPaging: false` so BreakFlow dictates the exact page cuts:

```typescript
import { jsPDF } from 'jspdf';
import { createPaginator } from '@breakflow/browser';

// 1. Paginate with BreakFlow (handles tables, cards, headers, and margins)
const paginator = createPaginator({
  page: { format: 'A4', margin: '15mm' },
  smartDefaults: true,
  table: { repeatHeader: true }
});

const { element } = await paginator.paginate('#invoice-container');

// 2. Export cleanly with jsPDF
const pdf = new jsPDF({ format: 'a4', unit: 'mm' });

await pdf.html(element, {
  callback: (doc) => doc.save('invoice.pdf'),
  autoPaging: false // ⚠️ IMPORTANT: Disables jsPDF's naive slicing; BreakFlow controls the pages!
});
```

### 2. Client-Side with `html2pdf.js`

```typescript
import html2pdf from 'html2pdf.js';
import { createPaginator } from '@breakflow/browser';

const paginator = createPaginator({ page: { format: 'A4', margin: '10mm' } });
const { element } = await paginator.paginate('#report');

html2pdf()
  .from(element)
  .set({
    pagebreak: { mode: ['css', 'legacy'] }, // Respects BreakFlow's .breakflow-page breaks
    jsPDF: { format: 'a4', unit: 'mm' }
  })
  .save('report.pdf');
```

### 3. Server-Side with Node.js & `Playwright` / `Puppeteer`

#### Option A: Using `@breakflow/playwright` (All-in-one)
```typescript
import { generatePdf } from '@breakflow/playwright';

const { pdfBuffer, result } = await generatePdf({
  url: 'http://localhost:3000/report/42',
  selector: '#report-content',
  output: './report.pdf',
  page: { format: 'A4', margin: '15mm' }
});
```

#### Option B: Using Native `Puppeteer` or `Playwright`
```typescript
import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000/statement');

// 1. Run BreakFlow in the browser context
await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/@breakflow/browser/dist/index.global.js' });
await page.evaluate(async () => {
  const paginator = window.BreakFlow.createPaginator({ page: { format: 'A4', margin: '15mm' } });
  await paginator.paginate('#statement', { replaceOriginal: true, injectStyles: true });
});

// 2. Print with Chromium's native vector PDF engine (zero page-break defects!)
await page.pdf({
  path: 'statement.pdf',
  format: 'A4',
  printBackground: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 } // Margins are already handled by BreakFlow
});

await browser.close();
```

### 4. Native Browser Print Dialog (`window.print()`)

```typescript
import { createPaginator } from '@breakflow/browser';

const paginator = createPaginator({ page: { format: 'A4', margin: '15mm' } });

// Replaces the element and injects CSS @page rules
await paginator.paginate('#document-to-print', {
  replaceOriginal: true,
  injectStyles: true
});

// Open standard browser print / save as PDF dialog
window.print();
```

---

## 💻 Command Line Interface (CLI)

```bash
# Analyze HTML document for pagination defects
breakflow analyze report.html

# Output machine-readable JSON for CI integration
breakflow analyze report.html --json

# Lint document and fail CI on severe pagination defects
breakflow lint report.html --fail-on-warning

# Render print-perfect PDF with BreakFlow pagination
breakflow pdf report.html --output report.pdf

# Render PDF with visual debug overlay enabled
breakflow pdf report.html --output report.pdf --debug
```

---

## Declarative HTML Rules

Add semantic attributes directly in your HTML templates:

```html
<!-- Prevent element from splitting across pages -->
<section data-breakflow="keep">
  <h3>Payment Details</h3>
  <p>Account details stay intact on one page.</p>
</section>

<!-- Keep heading with subsequent content (prevents orphan heading) -->
<h2 data-breakflow="keep-next">
  Work Experience
</h2>

<!-- Force page break before an element -->
<div data-breakflow="break-before">
  <h2>Chapter 2: Cloud Infrastructure</h2>
</div>

<!-- Table with repeating header -->
<table data-breakflow="table">
  <thead data-breakflow="repeat">
    <tr><th>Item</th><th>Price</th></tr>
  </thead>
  <tbody>...</tbody>
</table>
```

---

## JavaScript / TypeScript Configuration

Use the strongly typed `defineConfig()` helper:

```typescript
import { defineConfig } from '@breakflow/core';

export default defineConfig({
  page: {
    format: 'A4',
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
  },
  smartDefaults: true,
  rules: {
    keepTogether: ['.card', '.invoice-item', 'figure'],
    keepWithNext: ['h1', 'h2', 'h3'],
    breakBefore: ['.chapter-start']
  },
  table: {
    repeatHeader: true,
    preventRowSplit: true
  },
  penalties: {
    keepTogether: 100_000,
    tableRowSplit: 100_000,
    keepWithNext: 30_000,
    orphanHeading: 20_000,
    whitespace: 1
  }
});
```

---

## Smart Defaults

When `smartDefaults: true` (default):
* `h1`-`h6`: Automatically marked `keepWithNext` to avoid orphan headings.
* `figure` and `img + figcaption`: Kept together as an atomic group.
* `table > tr`: Slicing rows midway is prevented.
* `table > thead`: Headers repeat on subsequent pages when a table splits.
* `pre`, `blockquote`: Kept together when fitting on a single page.

---

## Analyze Mode (First-Class Feature)

Inspect pagination problems and automatic fixes without modifying the document:

```text
$ breakflow analyze invoice.html

BreakFlow Analysis for: invoice.html
──────────────────────────────────────────────────
Pages: 2  |  Errors: 0  |  Warnings: 0  |  Fixes Applied: 1

  ✔ No pagination issues detected. Document flows cleanly.

Automatic Fixes Applied:
  ✦ Moved div.totals-wrapper to page 2 to avoid split (moved to p.2)

Completed in 19ms (5 layout nodes measured)
```

---

## Debug Mode

Enable visual debug overlay (`debug: true` or `--debug`):
* Physical page boundary guidelines.
* Page status badges displaying used vs available vertical budget.
* Green highlights for elements moved to prevent bad breaks.
* Red highlights for issues or degraded elements.
* Completely non-intrusive: overlay never alters measured layout geometry.

---

## Table Pagination

BreakFlow features a dedicated table pagination planner:
* **Row Unit Preservation**: Table rows are never sliced in half.
* **Repeating `<thead>`**: Automatically cloned and prepended to continuation slices.
* **Column Geometry Preservation**: Copies column widths via `<colgroup>` and enforces `table-layout: fixed` so columns never jump between pages.

---

## Oversized Elements

If an element marked `keepTogether` is taller than the entire page (e.g. 1400px on a 1000px page):
* BreakFlow **never loops infinitely** or generates blank pages.
* It safely degrades `keepTogether`.
* Inspects child elements and paginates them across pages.
* Emits an `oversized-element` diagnostic warning.

---

## Limitations

* **Multi-column layouts**: Content balancing across CSS columns spanning multiple physical pages is scheduled for a future milestone.
* **Scrollable containers**: Elements with `overflow: auto` or `scroll` must be set to `overflow: visible` in print stylesheets.
* See [docs/limitations.md](docs/limitations.md) for full details.

---

## Architecture & Documentation

* [Architecture Overview](docs/architecture.md)
* [Pagination Algorithm & Scoring](docs/pagination-algorithm.md)
* [Browser Measurement & Sandbox](docs/browser-measurement.md)
* [Table Pagination Module](docs/tables.md)
* [Debugging & Analyze Mode](docs/debugging.md)
* [Known Limitations](docs/limitations.md)

---

## License

MIT © BreakFlow Contributors
