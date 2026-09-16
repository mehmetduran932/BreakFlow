# BreakFlow

> **Intelligent pagination for HTML and PDF.**  
> *Fix broken page breaks before they reach your PDF.*

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

## Quick Start

### 1. Browser Usage

```typescript
import { createPaginator } from '@breakflow/browser';

const paginator = createPaginator({
  page: {
    format: 'A4',
    margin: { top: '15mm', bottom: '15mm', left: '15mm', right: '15mm' }
  },
  smartDefaults: true,
  table: {
    repeatHeader: true,
    preventRowSplit: true
  }
});

// Analyze without altering the DOM
const report = await paginator.analyze('#report');
console.log(`Pages: ${report.pageCount}, Issues found: ${report.issues.length}`);

// Paginate and receive clean print DOM
const result = await paginator.paginate('#report', {
  replaceOriginal: false,
  injectStyles: true
});

document.body.appendChild(result.element);
```

### 2. Playwright PDF Generation

```typescript
import { generatePdf } from '@breakflow/playwright';

const { pdfBuffer, result } = await generatePdf({
  url: 'http://localhost:3000/invoice/123',
  selector: '#invoice',
  output: './invoice.pdf',
  page: {
    format: 'A4',
    margin: '15mm'
  }
});

console.log(`Generated ${result.pageCount}-page PDF with ${result.fixes.length} fixes applied!`);
```

### 3. Command Line Interface (CLI)

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
