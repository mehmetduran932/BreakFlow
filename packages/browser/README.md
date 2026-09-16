# @breakflow/browser

> **Browser DOM layout measurement, sandbox cloning, DOM pagination, and debug overlay for BreakFlow.**

[![NPM Version](https://img.shields.io/npm/v/%40breakflow%2Fbrowser?style=for-the-badge&color=CB3837&logo=npm)](https://www.npmjs.com/package/@breakflow/browser)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20App-000000?style=for-the-badge&logo=vercel)](https://temporary-fast-argon-5v5qgvo.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://github.com/mehmetduran932/BreakFlow/blob/main/LICENSE)

🚀 **[Try the Live Interactive Demo](https://temporary-fast-argon-5v5qgvo.vercel.app/)** *(Angular 22 + Signals + client-side jsPDF showcase)*

---

## Overview

`@breakflow/browser` brings intelligent HTML pagination into web browsers. It analyzes printable HTML containers, measures exact layout geometry, and reconstructs pixel-perfect paged containers (`.breakflow-page`) without ever mutating or disturbing your live application DOM.

Perfect for **Angular, React, Vue, Svelte, or Vanilla JavaScript** applications generating invoices, statements, resumes, or multi-page analytic reports.

## Key Features

- **Non-Destructive Sandbox**: Clones your printable component into a hidden `iframe` sandbox for layout measurement. Reactive application states (e.g. Angular Signals, React state) remain completely untouched.
- **Accurate CSS Measurement**: Respects stylesheets, web fonts, padding, borders, and CSS vertical margin collapsing.
- **Smart Table Slicing**: Automatically splits long tables across pages, cloning and repeating `<thead>` headers with fixed column geometries on every continuation slice.
- **Visual Debug Mode**: Renders page boundary guidelines, dimension badges, and vertical page budget analysis without modifying layout geometry.
- **Client-Side PDF Integration**: Prepares clean vector print DOM ready for browser print dialog (`window.print()`) or client-side libraries like **jsPDF** (`jsPDF.html()` with `autoPaging: false`).

---

## Installation

```bash
npm install @breakflow/core @breakflow/browser
```

Or using **pnpm** / **yarn**:
```bash
pnpm add @breakflow/core @breakflow/browser
# or
yarn add @breakflow/core @breakflow/browser
```

---

## Quick Start

```typescript
import { createPaginator } from '@breakflow/browser';

// 1. Create a paginator instance with A4 format and smart defaults
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

// 2. Analyze without altering your live DOM
const analysis = await paginator.analyze('#invoice-report');
console.log(`Planned Pages: ${analysis.pageCount}, Issues: ${analysis.issues.length}`);

// 3. Generate printable paged DOM
const result = await paginator.paginate('#invoice-report', {
  replaceOriginal: false,
  injectStyles: true
});

// 4. Mount paginated pages or pass to jsPDF / window.print()
document.getElementById('print-container')!.appendChild(result.element);
```

### Client-Side jsPDF Integration Example

```typescript
import { jsPDF } from 'jspdf';
import { createPaginator } from '@breakflow/browser';

const paginator = createPaginator({ page: { format: 'A4', margin: '15mm' } });
const { element } = await paginator.paginate('#printable-area');

const pdf = new jsPDF({ format: 'a4', unit: 'mm' });

// Use autoPaging: false so BreakFlow controls exact physical page slices
await pdf.html(element, {
  callback: (doc) => doc.save('document.pdf'),
  autoPaging: false
});
```

---

## Monorepo Packages

- [`@breakflow/core`](https://www.npmjs.com/package/@breakflow/core) - Core algorithmic engine
- [`@breakflow/browser`](https://www.npmjs.com/package/@breakflow/browser) - DOM layout measurement & sandbox paginator (this package)
- [`@breakflow/playwright`](https://www.npmjs.com/package/@breakflow/playwright) - Server-side Headless Chromium PDF adapter
- [`@breakflow/cli`](https://www.npmjs.com/package/@breakflow/cli) - Command-line analysis & PDF generation tool

---

## Links

- **Live Demo**: [temporary-fast-argon-5v5qgvo.vercel.app](https://temporary-fast-argon-5v5qgvo.vercel.app/)
- **GitHub Repository**: [github.com/mehmetduran932/BreakFlow](https://github.com/mehmetduran932/BreakFlow)
- **Browser Measurement Docs**: [docs/browser-measurement.md](https://github.com/mehmetduran932/BreakFlow/blob/main/docs/browser-measurement.md)

## License

MIT © [BreakFlow Contributors](https://github.com/mehmetduran932/BreakFlow)
