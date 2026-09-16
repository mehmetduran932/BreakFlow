# @breakflow/cli

> **Command-line interface to analyze, lint, and render PDFs with BreakFlow intelligent pagination.**

[![NPM Version](https://img.shields.io/npm/v/%40breakflow%2Fcli?style=for-the-badge&color=CB3837&logo=npm)](https://www.npmjs.com/package/@breakflow/cli)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel%20App-000000?style=for-the-badge&logo=vercel)](https://temporary-fast-argon-5v5qgvo.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://github.com/mehmetduran932/BreakFlow/blob/main/LICENSE)

🚀 **[Try the Live Interactive Demo](https://temporary-fast-argon-5v5qgvo.vercel.app/)** *(Angular 22 + Signals + client-side jsPDF showcase)*

---

## Overview

`@breakflow/cli` is the official command-line tool for BreakFlow. It lets developers inspect printable HTML documents, detect pagination defects, enforce print linting rules in CI pipelines, and render high-fidelity vector PDFs directly from the terminal.

Think **ESLint for printable documents**, with an automated fix engine.

## Key Features

- **Analyze Mode**: Scans HTML documents or live URLs and outputs human-readable or JSON reports of pagination defects (orphan headings, overflowing cards, table splits).
- **CI/CD Linting**: Integrates into GitHub Actions or GitLab CI to fail builds when critical print defects occur.
- **Headless PDF Rendering**: Renders vector PDFs via Chromium with BreakFlow's intelligent pagination rules applied.
- **Visual Debug Overlays**: Generates PDFs with physical page boundary guides and capacity budgets overlaid for visual inspection.

---

## Installation

```bash
npm install -g @breakflow/cli
```

Or run directly without installing:
```bash
npx @breakflow/cli analyze report.html
```

---

## Commands & Usage

### 1. Analyze an HTML Document

Inspect page breaks and automatic layout fixes:
```bash
breakflow analyze invoice.html
```

Output machine-readable JSON for automated toolchains:
```bash
breakflow analyze invoice.html --json
```

### 2. Lint HTML for Pagination Defects in CI

Enforce zero broken page breaks in pull requests:
```bash
breakflow lint report.html --fail-on-warning
```

### 3. Render High-Fidelity PDF

Paginate and render directly to a vector PDF:
```bash
breakflow pdf invoice.html -o invoice.pdf
```

With visual page budget overlay enabled:
```bash
breakflow pdf invoice.html -o invoice-debug.pdf --debug
```

### 4. Live Preview Server

Serve printable documents with real-time browser pagination preview:
```bash
breakflow serve ./templates --port 4000
```

---

## Monorepo Packages

- [`@breakflow/core`](https://www.npmjs.com/package/@breakflow/core) - Core algorithmic engine
- [`@breakflow/browser`](https://www.npmjs.com/package/@breakflow/browser) - DOM layout measurement & sandbox paginator
- [`@breakflow/playwright`](https://www.npmjs.com/package/@breakflow/playwright) - Server-side Headless Chromium PDF adapter
- [`@breakflow/cli`](https://www.npmjs.com/package/@breakflow/cli) - Command-line analysis & PDF generation tool (this package)

---

## Links

- **Live Demo**: [temporary-fast-argon-5v5qgvo.vercel.app](https://temporary-fast-argon-5v5qgvo.vercel.app/)
- **GitHub Repository**: [github.com/mehmetduran932/BreakFlow](https://github.com/mehmetduran932/BreakFlow)
- **CLI Documentation**: [docs/debugging.md](https://github.com/mehmetduran932/BreakFlow/blob/main/docs/debugging.md)

## License

MIT © [BreakFlow Contributors](https://github.com/mehmetduran932/BreakFlow)
