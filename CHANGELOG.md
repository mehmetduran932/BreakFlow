# Changelog

All notable changes to the **BreakFlow** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2026-09-16

### 🚀 Added
- **Monorepo Architecture**:
  - Powered by `pnpm` workspaces and `TurboRepo` for fast, reproducible builds and tests.
  - Strict TypeScript configuration (`ESNext`, ESM/CJS dual-build support via `tsup`).
- **`@breakflow/core`**:
  - Pure, zero-DOM core layout tree and pagination algorithm engine.
  - Page geometry calculators supporting standard page formats (`A3`, `A4`, `A5`, `Letter`, `Legal`) in portrait/landscape and custom dimensions (`mm`, `cm`, `in`, `pt`, `px`).
  - Break decision engine with heuristic penalties for orphan headings, widows, component splitting, and unbalanced pages.
  - Smart default break rules honoring CSS break properties (`break-inside: avoid`, `break-before: page`, `break-after: page`).
  - Comprehensive Diagnostic Reporter categorizing layout issues (`split-component`, `orphan-heading`, `overflow-block`, `table-row-split`, `empty-page`).
- **`@breakflow/browser`**:
  - DOM adapter that clones printable containers into a non-destructive, hidden `iframe` sandbox.
  - Deep layout tree extraction preserving styles, computed heights, and vertical margin collapsing.
  - Automatic table splitting with repeated `thead` headers across continuation pages.
  - CSS print injection producing pixel-perfect paged containers (`.breakflow-page`) with optional headers, footers, and page numbers.
  - Clean API: `createPaginator()`, `paginator.analyze()`, `paginator.paginate()`.
- **`@breakflow/playwright`**:
  - Headless Chromium PDF generation adapter.
  - Injects BreakFlow browser runtime, executes layout calculations, and renders high-fidelity vector PDFs via Playwright's `page.pdf()`.
  - CLI and programmatic API support: `generatePdf({ url, selector, output, page })`.
- **`@breakflow/cli`**:
  - Binary CLI `breakflow` with subcommands:
    - `breakflow analyze <html-or-url>`: Analyze document structure and print detailed issue reports.
    - `breakflow render <html-or-url> -o <output.pdf>`: Paginate and render to PDF.
    - `breakflow serve`: Start a preview server for visual pagination debugging.
- **Framework Compatibility**:
  - Verified and tested with modern frameworks, including **Angular 22** (Signals & standalone architecture) and client-side **jsPDF** integration (`autoPaging: false`).
- **End-to-End Test Suite**:
  - 15 comprehensive unit tests verifying core algorithms and tree traversal (`vitest`).
  - 12 automated browser integration tests across standard print test cases (`playwright`).
  - Realistic examples including multi-page CVs, corporate invoices, long analytic reports, and vanilla JavaScript apps.
