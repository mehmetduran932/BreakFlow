# Debugging & Visual Inspection

## Visual Debug Overlay

BreakFlow provides an isolated visual debug overlay for development:

```typescript
const paginator = createPaginator({
  debug: true
});
```

Or via CLI:

```bash
breakflow pdf report.html --debug --output report.pdf
```

### Overlay Features

* **Page Boundary Boxes**: Outlines physical page boxes with dashed guidelines.
* **Page Status Badges**: Displays a high-contrast badge in the top corner of each page:
  `Page 2 / 5 [Used: 780px / 1009px]`
* **Automatic Fix Highlights**: Outlines elements moved to prevent bad page breaks with a green border and informative tooltip (`BreakFlow Fix: Moved heading #intro to page 2 with subsequent content`).
* **Issue Highlights**: Outlines problematic or oversized elements with a red border and error message tooltip.
* **Zero Geometry Interference**: The overlay container uses `pointer-events: none` and `position: absolute` with independent stacking contexts, guaranteeing that enabling debug mode never modifies document geometry or page count.

## Analyze Mode (Programmatic Diagnostic Inspection)

You can inspect pagination metrics and issue reports without performing DOM transformations:

```typescript
import { createPaginator } from '@breakflow/browser';

const paginator = createPaginator();
const result = await paginator.analyze('#report');

console.log('Total pages:', result.pageCount);
console.log('Issues found:', result.issues);
console.log('Fixes applied:', result.fixes);
console.log('Execution timing:', result.metrics);
```

### Example Issue Object:

```json
{
  "type": "orphan-heading",
  "severity": "warning",
  "page": 3,
  "selector": "#experience-title",
  "message": "Orphan heading detected at bottom of page 3: #experience-title"
}
```

### Example Applied Fix Object:

```json
{
  "type": "prevent-orphan-heading",
  "selector": "#experience-title",
  "fromPage": 2,
  "toPage": 3,
  "description": "Moved heading #experience-title to page 3 with subsequent content"
}
```
