# BreakFlow Architecture & Design Philosophy

## What is BreakFlow?

**BreakFlow** is an intelligent, renderer-agnostic pagination engine for HTML and PDF generation.

Tagline:
> *"Intelligent pagination for HTML and PDF."*  
> *"Fix broken page breaks before they reach your PDF."*

Think of BreakFlow as **"ESLint for printable HTML"** combined with **an intelligent layout pagination compiler**.

## What BreakFlow is NOT

* **BreakFlow is NOT another HTML-to-PDF engine.** It does not contain a custom font rasterizer, 2D vector drawing pipeline, or low-level PDF byte synthesizer.
* **BreakFlow does NOT touch the host application DOM.** In frameworks like React, Angular, or Vue, the host DOM is never directly modified or reflowed.
* **BreakFlow is NOT a screenshot-to-PDF tool.** Unlike tools that rasterize canvas bitmaps (e.g. `html2canvas`), BreakFlow creates pure, structured, selectable-text documents preserving all vector fonts, DOM semantics, links, and accessibility.

## Conceptual Pipeline

```
HTML / Application DOM
       │
       ▼
 [Isolated Sandbox] (Hidden IFrame + Style Extraction)
       │
       ▼
 [Asset Readiness] (Web Fonts + Image Eager Stabilization)
       │
       ▼
 [Layout Measurement] (Physical Page Box Resolution + Bounding Boxes)
       │
       ▼
 [BreakFlow Pagination Engine] (Layout Tree + Candidate Scoring + Table Splitter)
       │
       ▼
 [Paginated DOM] (Container Slices + Print Normalization Styles)
       │
       ▼
 [Chromium / Playwright / Browser Print] (Direct Text-Preserving Print)
       │
       ▼
 High-Fidelity PDF Output
```

## Monorepo Architecture

BreakFlow is organized as an ESM-first pnpm workspace:

```
breakflow/
├── packages/
│   ├── core/         # Pure TypeScript: models, scoring engine, greedy strategy, table planner
│   ├── browser/      # Browser DOM measurement, isolated iframe sandbox, asset readiness, debug overlay
│   ├── playwright/   # Chromium headless automation adapter, injects BreakFlow, exports vector PDF
│   └── cli/          # Command-line interface: analyze, lint, pdf commands with CI exit codes
├── examples/
│   ├── vanilla/      # Live browser playground with controls and real-time pagination diagnostics
│   ├── cv/           # Multi-page resume demonstrating orphan heading prevention
│   ├── invoice/      # Itemized commercial invoice demonstrating repeating <thead> across pages
│   └── long-report/  # Multi-section technical whitepaper with figures, tables, and code blocks
├── tests/
│   ├── fixtures/     # 15 standardized HTML test fixtures covering edge cases
│   └── integration/  # Playwright browser integration test suites validating 12 acceptance scenarios
└── docs/             # In-depth architectural and algorithmic documentation
```

## Decoupled Strategy Pattern

The pagination planner uses an inversion-of-control strategy interface:

```typescript
export interface PaginationStrategy {
  readonly name: string;
  paginate(input: PaginationInput): PaginationPlan;
}
```

The default implementation is `GreedyScoredStrategy`, which balances computational speed with semantic layout scoring. Because planning is decoupled from DOM manipulation, future algorithms (such as an integer linear programming or dynamic-programming `OptimalPaginationStrategy`) can be introduced without altering browser measurement or rendering layers.
