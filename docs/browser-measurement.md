# Browser Measurement & Isolated Sandbox

## Why Live DOM Direct Pagination is Prohibited

Modern client-side frameworks (such as React, Angular, and Vue) maintain virtual DOM representations or internal component hierarchies. Mutating the live application DOM directly during pagination causes:
* React reconciliation crashes and unmount errors
* Angular change detection cycle loops
* Disruptive visual flickering for active users
* Style leakage where print rules pollute the active user interface

## The Isolated IFrame Strategy

BreakFlow provisions an isolated `HTMLIFrameElement` detached from the main viewport:

```typescript
const iframe = parentDoc.createElement('iframe');
iframe.style.position = 'fixed';
iframe.style.top = '0';
iframe.style.left = '-99999px';
iframe.style.width = '1400px';
iframe.style.height = '2000px';
iframe.style.border = 'none';
iframe.style.opacity = '0';
iframe.style.pointerEvents = 'none';
```

### Architectural Trade-offs: IFrame vs. Shadow DOM vs. Hidden Div

| Strategy | Style Isolation | Host DOM Safety | Real CSS Resolution | Trade-offs |
| :--- | :--- | :--- | :--- | :--- |
| **Hidden IFrame (BreakFlow)** | **Complete** | **Zero host mutation** | **100% genuine** | Requires copying `<style>` & `<link>` tags |
| **Shadow DOM** | Partial | High | Good | Inherits certain global styles; difficult with complex print stylesheets |
| **Hidden Div in Body** | Poor | Low (can pollute app) | Good | Global CSS rules collide; MutationObservers fire in host app |

BreakFlow chose the **Hidden IFrame** approach because it provides a genuine browser `window` and `document` context with zero side-effects on the host application.

## Asset Readiness Detection

Layout measurements are inaccurate if fonts or images have not finished rasterizing. BreakFlow implements deterministic readiness detection:

1. **Web Fonts**:
   ```typescript
   await iframeDoc.fonts.ready;
   ```
2. **Images**:
   - Cloned images marked `loading="lazy"` are converted to `loading="eager"` so the browser downloads them inside the sandbox.
   - Images are checked for `.complete && .naturalWidth !== 0`.
   - Asynchronous `load` and `error` listeners are attached with a configurable safety timeout (default: 8000ms).
   - Broken image links resolve gracefully to avoid stalling document pagination.

## Physical CSS Page Box Measurement

Rather than hardcoding arbitrary pixel conversion constants (e.g. $1\text{mm} \approx 3.7795\text{px}$), BreakFlow mounts an actual physical test page element:

```html
<div class="breakflow-page" style="width: 210mm; height: 297mm;">
  <div class="breakflow-page-content" style="padding: 15mm;"></div>
</div>
```

The engine reads `getBoundingClientRect()` directly from the browser layout engine. This guarantees that device pixel ratios (DPR), zoom scales, and browser-specific font metrics match physical printing specifications exactly.
