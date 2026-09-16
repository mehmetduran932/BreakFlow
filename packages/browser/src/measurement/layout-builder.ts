import type {
  LayoutNode,
  LayoutNodeType,
  LayoutNodeRules,
  ResolvedBreakFlowConfig
} from '@breakflow/core';

let nodeCounter = 0;

export function buildLayoutTree(
  rootElement: HTMLElement,
  config: ResolvedBreakFlowConfig
): LayoutNode[] {
  const containerRect = rootElement.getBoundingClientRect();
  const visibleChildren = (Array.from(rootElement.children) as HTMLElement[]).filter((el) => isElementVisible(el));
  nodeCounter = 0;

  return visibleChildren.map((el, index) => {
    const nextSibling = visibleChildren[index + 1];
    return buildNode(el, containerRect, config, nextSibling);
  });
}

function isElementVisible(el: HTMLElement): boolean {
  if (el.tagName.toLowerCase() === 'script' || el.tagName.toLowerCase() === 'style') {
    return false;
  }
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  return true;
}

function determineNodeType(tagName: string): LayoutNodeType {
  switch (tagName) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'h4':
    case 'h5':
    case 'h6':
      return 'heading';
    case 'p':
      return 'paragraph';
    case 'table':
      return 'table';
    case 'thead':
      return 'table-head';
    case 'tbody':
      return 'table-body';
    case 'tr':
      return 'table-row';
    case 'img':
      return 'image';
    case 'figure':
      return 'figure';
    case 'figcaption':
      return 'figcaption';
    case 'ul':
    case 'ol':
      return 'list';
    case 'li':
      return 'list-item';
    case 'pre':
    case 'code':
      return 'code';
    default:
      return 'block';
  }
}

function matchesAnySelector(el: HTMLElement, selectors: string[]): boolean {
  for (const sel of selectors) {
    try {
      if (el.matches(sel)) return true;
    } catch {
      // Ignore invalid selectors
    }
  }
  return false;
}

function extractNodeRules(
  el: HTMLElement,
  type: LayoutNodeType,
  tagName: string,
  config: ResolvedBreakFlowConfig
): LayoutNodeRules {
  const computed = window.getComputedStyle(el);

  // 1. Declarative HTML data attributes
  const dataBreakflow = el.getAttribute('data-breakflow') || '';
  const hasAttrKeep = dataBreakflow === 'keep' || el.hasAttribute('data-breakflow-keep');
  const hasAttrKeepNext = dataBreakflow === 'keep-next' || el.hasAttribute('data-breakflow-keep-next');
  const hasAttrBreakBefore = dataBreakflow === 'break-before' || el.hasAttribute('data-breakflow-break-before');
  const hasAttrBreakAfter = dataBreakflow === 'break-after' || el.hasAttribute('data-breakflow-break-after');

  // 2. CSS Custom Properties
  const cssKeep = computed.getPropertyValue('--breakflow-keep').trim();
  const cssKeepNext = computed.getPropertyValue('--breakflow-keep-next').trim();
  const cssBreakBefore = computed.getPropertyValue('--breakflow-break-before').trim();
  const cssBreakAfter = computed.getPropertyValue('--breakflow-break-after').trim();

  // 3. Modern CSS Break Properties
  const breakInside = computed.breakInside || computed.getPropertyValue('break-inside');
  const breakBeforeVal = computed.breakBefore || computed.getPropertyValue('break-before');
  const breakAfterVal = computed.breakAfter || computed.getPropertyValue('break-after');

  const cssAvoidBreakInside = breakInside === 'avoid' || breakInside === 'avoid-page';
  const cssForceBreakBefore = breakBeforeVal === 'page' || breakBeforeVal === 'always';
  const cssForceBreakAfter = breakAfterVal === 'page' || breakAfterVal === 'always';

  // 4. Config Selectors
  const selectorKeep = matchesAnySelector(el, config.rules.keepTogether);
  const selectorKeepNext = matchesAnySelector(el, config.rules.keepWithNext);
  const selectorBreakBefore = matchesAnySelector(el, config.rules.breakBefore);
  const selectorBreakAfter = matchesAnySelector(el, config.rules.breakAfter);

  // 5. Smart Defaults
  let smartKeepTogether = false;
  let smartKeepWithNext = false;
  let repeatHeader = config.table.repeatHeader;
  let preventRowSplit = config.table.preventRowSplit;

  if (config.smartDefaults) {
    if (type === 'heading') {
      smartKeepWithNext = true;
    }
    if (type === 'figure' || type === 'code' || tagName === 'blockquote') {
      smartKeepTogether = true;
    }
    if (type === 'table-row') {
      preventRowSplit = true;
    }
  }

  const keepTogether =
    hasAttrKeep ||
    cssKeep === 'true' ||
    cssAvoidBreakInside ||
    selectorKeep ||
    smartKeepTogether;

  const keepWithNext =
    hasAttrKeepNext ||
    cssKeepNext === 'true' ||
    selectorKeepNext ||
    smartKeepWithNext;

  const breakBefore =
    hasAttrBreakBefore ||
    cssBreakBefore === 'true' ||
    cssForceBreakBefore ||
    selectorBreakBefore;

  const breakAfter =
    hasAttrBreakAfter ||
    cssBreakAfter === 'true' ||
    cssForceBreakAfter ||
    selectorBreakAfter;

  return {
    keepTogether,
    keepWithNext,
    breakBefore,
    breakAfter,
    repeatHeader,
    preventRowSplit
  };
}

function generateSelector(el: HTMLElement): string {
  if (el.id) return `#${el.id}`;
  const tag = el.tagName.toLowerCase();
  const classes = Array.from(el.classList).slice(0, 2).join('.');
  if (classes) return `${tag}.${classes}`;
  return tag;
}

function buildNode(
  el: HTMLElement,
  containerRect: DOMRect,
  config: ResolvedBreakFlowConfig,
  nextSibling?: HTMLElement
): LayoutNode {
  const id = `bf-node-${++nodeCounter}`;
  el.setAttribute('data-breakflow-node-id', id);

  const tagName = el.tagName.toLowerCase();
  const type = determineNodeType(tagName);
  const rules = extractNodeRules(el, type, tagName, config);

  const rect = el.getBoundingClientRect();
  const computed = window.getComputedStyle(el);
  const marginBottom = parseFloat(computed.marginBottom) || 0;

  let effectiveHeight = rect.height;
  if (nextSibling) {
    const nextRect = nextSibling.getBoundingClientRect();
    const verticalGap = nextRect.top - rect.top;
    if (verticalGap > 0) {
      effectiveHeight = Math.max(effectiveHeight, verticalGap);
    }
  } else {
    effectiveHeight += marginBottom;
  }

  const bounds = {
    top: rect.top - containerRect.top,
    bottom: rect.bottom - containerRect.top,
    left: rect.left - containerRect.left,
    right: rect.right - containerRect.left,
    width: rect.width,
    height: effectiveHeight
  };

  const children: LayoutNode[] = [];

  // If table, recursively inspect thead and rows
  if (type === 'table') {
    const tableParts = (Array.from(el.children) as HTMLElement[]).filter((part) => isElementVisible(part));
    for (let p = 0; p < tableParts.length; p++) {
      children.push(buildNode(tableParts[p]!, containerRect, config, tableParts[p + 1]));
    }
  } else if (type === 'table-head' || type === 'table-body') {
    const rows = (Array.from(el.querySelectorAll('tr')) as HTMLElement[]).filter((row) => isElementVisible(row));
    for (let r = 0; r < rows.length; r++) {
      children.push(buildNode(rows[r]!, containerRect, config, rows[r + 1]));
    }
  } else if (bounds.height > 600 && el.children.length > 0) {
    // For large blocks (candidates for oversized element splitting), inspect direct children
    const elChildren = (Array.from(el.children) as HTMLElement[]).filter((child) => isElementVisible(child));
    for (let c = 0; c < elChildren.length; c++) {
      children.push(buildNode(elChildren[c]!, containerRect, config, elChildren[c + 1]));
    }
  }

  return {
    id,
    selector: generateSelector(el),
    tagName,
    type,
    bounds,
    breakable: !rules.keepTogether || children.length > 0,
    rules,
    children,
    domRefId: id
  };
}
