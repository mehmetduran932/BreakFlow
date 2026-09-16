# @breakflow/playwright

> **Headless Chromium PDF adapter with BreakFlow intelligent pagination injection and diagnostics.**

[![NPM Version](https://img.shields.io/npm/v/%40breakflow%2Fplaywright?style=for-the-badge&color=CB3837&logo=npm)](https://www.npmjs.com/package/@breakflow/playwright)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20App-000000?style=for-the-badge&logo=vercel)](https://temporary-fast-argon-5v5qgvo.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://github.com/mehmetduran932/BreakFlow/blob/main/LICENSE)

🚀 **[Try the Live Interactive Demo](https://temporary-fast-argon-5v5qgvo.vercel.app/)** *(Angular 22 + Signals + client-side jsPDF showcase)*

---

## Overview

`@breakflow/playwright` seamlessly combines BreakFlow's intelligent pagination engine with Headless Chromium to produce print-perfect vector PDF documents on the server.

Instead of letting Chromium cut through text lines, headings, or table rows with blunt CSS printing, `@breakflow/playwright` measures and restructures your document before calling `page.pdf()`.

## Key Features

- **High-Fidelity Vector Output**: Generates crisp vector text, selectable fonts, clickable URLs, and embedded metadata.
- **Server & Backend Ready**: Works in Node.js backend services, Express, NestJS, Docker containers, AWS Lambda, and CI/CD pipelines.
- **Simple API**: Provide a URL or local HTML file selector and receive a PDF buffer or write directly to disk.
- **Diagnostics Included**: Returns detailed analysis data alongside the PDF buffer detailing fixes applied, page budgets, and warnings.

---

## Installation

```bash
npm install -D @breakflow/playwright playwright
```

Or using **pnpm** / **yarn**:
```bash
pnpm add -D @breakflow/playwright playwright
# or
yarn add -D @breakflow/playwright playwright
```

---

## Quick Start

```typescript
import { generatePdf } from '@breakflow/playwright';

// Generate a high-fidelity PDF from an existing web page
const { pdfBuffer, result } = await generatePdf({
  url: 'http://localhost:3000/invoices/INV-2026-001',
  selector: '#invoice',
  output: './invoice.pdf',
  page: {
    format: 'A4',
    margin: '15mm'
  },
  debug: false
});

console.log(`Generated ${result.pageCount} page(s) with ${result.fixes.length} pagination fixes applied.`);
```

### Advanced Usage with an Existing Playwright Page

```typescript
import { chromium } from 'playwright';
import { paginatePage } from '@breakflow/playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto('http://localhost:3000/report');

// Injects BreakFlow runtime, analyzes layout, and paginates the DOM
const result = await paginatePage(page, {
  selector: '#report-container',
  page: { format: 'A4', margin: '20mm' }
});

// Render final PDF using Chromium's native vector engine
const pdfBuffer = await page.pdf({
  format: 'A4',
  printBackground: true,
  margin: { top: 0, bottom: 0, left: 0, right: 0 }
});

await browser.close();
```

---

## Monorepo Packages

- [`@breakflow/core`](https://www.npmjs.com/package/@breakflow/core) - Core algorithmic engine
- [`@breakflow/browser`](https://www.npmjs.com/package/@breakflow/browser) - DOM layout measurement & sandbox paginator
- [`@breakflow/playwright`](https://www.npmjs.com/package/@breakflow/playwright) - Server-side Headless Chromium PDF adapter (this package)
- [`@breakflow/cli`](https://www.npmjs.com/package/@breakflow/cli) - Command-line analysis & PDF generation tool

---

## Links

- **Live Demo**: [temporary-fast-argon-5v5qgvo.vercel.app](https://temporary-fast-argon-5v5qgvo.vercel.app/)
- **GitHub Repository**: [github.com/mehmetduran932/BreakFlow](https://github.com/mehmetduran932/BreakFlow)

## License

MIT © [BreakFlow Contributors](https://github.com/mehmetduran932/BreakFlow)
