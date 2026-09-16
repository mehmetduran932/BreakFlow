# @breakflow/core

> **Framework-independent core pagination engine, layout models, scoring, and diagnostics for BreakFlow.**

[![NPM Version](https://img.shields.io/npm/v/%40breakflow%2Fcore?style=for-the-badge&color=CB3837&logo=npm)](https://www.npmjs.com/package/@breakflow/core)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20App-000000?style=for-the-badge&logo=vercel)](https://temporary-fast-argon-5v5qgvo.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://github.com/mehmetduran932/BreakFlow/blob/main/LICENSE)

🚀 **[Try the Live Interactive Demo](https://temporary-fast-argon-5v5qgvo.vercel.app/)** *(Angular 22 + Signals + client-side jsPDF showcase)*

---

## Overview

`@breakflow/core` is the pure, zero-DOM core engine behind BreakFlow. It operates on an abstract layout tree representation, evaluating page break candidates, computing penalty scores, and producing deterministic page plans.

Because it has **zero external dependencies** and no browser DOM requirement, it runs anywhere: in Node.js, Web Workers, Edge runtimes, or in browser applications.

## Key Features

- **Page Geometry Calculators**: Full support for standard formats (`A3`, `A4`, `A5`, `Letter`, `Legal`), orientations (`portrait`, `landscape`), and custom dimensions (`mm`, `cm`, `in`, `pt`, `px`).
- **Break Scoring Engine**: Sophisticated penalty heuristics for:
  - Orphan headings (`keepWithNext`)
  - Component fragmentation (`keepTogether` / `break-inside: avoid`)
  - Table row slicing
  - Unbalanced whitespace / awkward page breaks
- **Table Splitting Planner**: Computes non-destructive multi-page slices for tabular data with repeating header preservation.
- **Diagnostic Reporter**: Emits actionable layout warnings and issue logs (`orphan-heading`, `split-component`, `overflow-block`, `empty-page`).
- **Declarative Configuration**: Strongly-typed `defineConfig()` helper with smart default presets.

---

## Installation

```bash
npm install @breakflow/core
```

Or using **pnpm** / **yarn**:
```bash
pnpm add @breakflow/core
# or
yarn add @breakflow/core
```

---

## Quick Example

```typescript
import { defineConfig, GreedyStrategy, calculatePageCapacity } from '@breakflow/core';

// 1. Define page geometry and rules
const config = defineConfig({
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

// 2. Compute available vertical budget (px at 96 DPI)
const capacity = calculatePageCapacity(config.page);
console.log(`Usable page height: ${capacity.contentHeight}px`);

// 3. Plan pagination strategy
const strategy = new GreedyStrategy(config);
// ... pass layout tree nodes to plan pagination
```

---

## Monorepo Packages

- [`@breakflow/core`](https://www.npmjs.com/package/@breakflow/core) - Core algorithmic engine (this package)
- [`@breakflow/browser`](https://www.npmjs.com/package/@breakflow/browser) - DOM layout measurement & sandbox paginator
- [`@breakflow/playwright`](https://www.npmjs.com/package/@breakflow/playwright) - Server-side Headless Chromium PDF adapter
- [`@breakflow/cli`](https://www.npmjs.com/package/@breakflow/cli) - Command-line analysis & PDF generation tool

---

## Links

- **GitHub Repository**: [github.com/mehmetduran932/BreakFlow](https://github.com/mehmetduran932/BreakFlow)
- **Live Demo**: [temporary-fast-argon-5v5qgvo.vercel.app](https://temporary-fast-argon-5v5qgvo.vercel.app/)
- **Documentation**: [BreakFlow Documentation](https://github.com/mehmetduran932/BreakFlow/tree/main/docs)

## License

MIT © [BreakFlow Contributors](https://github.com/mehmetduran932/BreakFlow)
