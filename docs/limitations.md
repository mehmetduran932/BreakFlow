# Known Limitations & Boundaries

## Scope & Technical Boundaries

While BreakFlow resolves the vast majority of HTML-to-PDF pagination failures, engineers should be aware of the following architectural boundaries in the current release:

### 1. CSS Multi-Column (`columns: 2`, `column-count`)
BreakFlow currently plans pagination along the primary vertical block flow axis. Multi-column newspaper-style layouts inside an individual section are measured as atomic blocks; balancing content across multi-columns that span multiple physical pages is scheduled for a future milestone.

### 2. Scrollable Overflow Containers (`overflow: auto | scroll`)
Elements with fixed heights and internal scrollbars do not print well in standard CSS. Ensure print stylesheets reset scroll containers (`overflow: visible !important; height: auto !important;`) so all content can be measured by BreakFlow.

### 3. Complex WebGL / 3D Canvas
WebGL contexts and dynamic `canvas` animations should render their final frame or export to an `<img>` element with data URI before triggering pagination to ensure deterministic snapshot timing.

### 4. Direct Node.js vs. Browser Environment
`@breakflow/core` is 100% pure TypeScript and runs in any JavaScript runtime (Node.js, Deno, Bun, Workers). However, `@breakflow/browser` requires a genuine browser DOM environment with `getComputedStyle` and `getBoundingClientRect`. For server-side rendering, use `@breakflow/playwright` or `@breakflow/cli`.

### 5. Security & Trust Boundaries
BreakFlow does not sanitize arbitrary malicious JavaScript. When rendering user-supplied HTML:
* Run Playwright inside an isolated container with minimal privileges.
* Disallow untrusted network requests if rendering sensitive internal documents.
* Treat user HTML as untrusted input and configure CSP (Content Security Policy) where applicable.
