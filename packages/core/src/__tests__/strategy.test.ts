import { describe, it, expect } from 'vitest';
import { GreedyScoredStrategy } from '../strategy/greedy-strategy.js';
import { resolveConfig } from '../config/define-config.js';
import type { LayoutNode } from '../types/node.js';

describe('GreedyScoredStrategy', () => {
  const config = resolveConfig();
  const strategy = new GreedyScoredStrategy();

  const makeNode = (id: string, height: number, rules: Partial<LayoutNode['rules']> = {}, type: LayoutNode['type'] = 'block', tagName = 'div'): LayoutNode => ({
    id,
    selector: `#${id}`,
    tagName,
    type,
    bounds: { top: 0, bottom: height, left: 0, right: 100, width: 100, height },
    breakable: true,
    rules: { keepTogether: false, keepWithNext: false, breakBefore: false, breakAfter: false, ...rules },
    children: []
  });

  it('should paginate items sequentially within page height', () => {
    // Page height = 1000px. Three items of 300px each fit on page 1. Fourth item (300px) goes to page 2.
    const nodes: LayoutNode[] = [
      makeNode('item-1', 300),
      makeNode('item-2', 300),
      makeNode('item-3', 300),
      makeNode('item-4', 300)
    ];

    const plan = strategy.paginate({
      nodes,
      pageContentHeight: 1000,
      pageContentWidth: 700,
      config
    });

    expect(plan.pages.length).toBe(2);
    expect(plan.pages[0]?.items.length).toBe(3);
    expect(plan.pages[1]?.items.length).toBe(1);
    expect(plan.pages[0]?.items[0]?.nodeId).toBe('item-1');
    expect(plan.pages[1]?.items[0]?.nodeId).toBe('item-4');
  });

  it('should move heading to next page if following item does not fit (orphan heading prevention)', () => {
    // Page height = 1000px.
    // item 1: 850px.
    // heading: 50px (remaining space: 100px; heading fits alone!)
    // following paragraph: 200px (cannot fit on page 1: 850 + 50 + 200 = 1100 > 1000).
    // Heading should move to page 2 together with following paragraph!
    const nodes: LayoutNode[] = [
      makeNode('item-1', 850),
      makeNode('heading-1', 50, { keepWithNext: true }, 'heading', 'h2'),
      makeNode('para-1', 200, {}, 'paragraph', 'p')
    ];

    const plan = strategy.paginate({
      nodes,
      pageContentHeight: 1000,
      pageContentWidth: 700,
      config
    });

    expect(plan.pages.length).toBe(2);
    // Page 1 should only have item-1
    expect(plan.pages[0]?.items.map((i) => i.nodeId)).toEqual(['item-1']);
    // Page 2 should have heading-1 AND para-1
    expect(plan.pages[1]?.items.map((i) => i.nodeId)).toEqual(['heading-1', 'para-1']);
    // Should have recorded fix
    expect(plan.fixes.some((f) => f.type === 'prevent-orphan-heading')).toBe(true);
  });

  it('should keep keepTogether card intact by moving to next page', () => {
    // Page height = 1000px.
    // item 1: 700px.
    // card: 400px (marked keepTogether).
    // Does not fit on page 1 (700 + 400 = 1100 > 1000).
    // Should move intact to page 2.
    const nodes: LayoutNode[] = [
      makeNode('item-1', 700),
      makeNode('card-1', 400, { keepTogether: true })
    ];

    const plan = strategy.paginate({
      nodes,
      pageContentHeight: 1000,
      pageContentWidth: 700,
      config
    });

    expect(plan.pages.length).toBe(2);
    expect(plan.pages[0]?.items[0]?.nodeId).toBe('item-1');
    expect(plan.pages[1]?.items[0]?.nodeId).toBe('card-1');
    expect(plan.fixes.some((f) => f.type === 'move-to-next-page')).toBe(true);
  });

  it('should safely degrade keepTogether on oversized elements without infinite loops or blank pages', () => {
    // Page height = 1000px.
    // Oversized card: 1400px tall with keepTogether: true!
    // Children: child-1 (600px), child-2 (800px).
    const child1 = makeNode('child-1', 600);
    const child2 = makeNode('child-2', 800);
    const oversizedCard: LayoutNode = {
      ...makeNode('oversized-card', 1400, { keepTogether: true }),
      children: [child1, child2]
    };

    const plan = strategy.paginate({
      nodes: [oversizedCard],
      pageContentHeight: 1000,
      pageContentWidth: 700,
      config
    });

    // Should generate warning
    expect(plan.issues.some((i) => i.type === 'oversized-element')).toBe(true);
    // Should split across pages
    expect(plan.pages.length).toBe(2);
    expect(plan.pages[0]?.items[0]?.nodeId).toBe('child-1');
    expect(plan.pages[1]?.items[0]?.nodeId).toBe('child-2');
  });

  it('should honor forced page breaks without creating empty pages', () => {
    const nodes: LayoutNode[] = [
      makeNode('item-1', 200),
      makeNode('item-2', 200, { breakBefore: true }),
      makeNode('item-3', 200)
    ];

    const plan = strategy.paginate({
      nodes,
      pageContentHeight: 1000,
      pageContentWidth: 700,
      config
    });

    expect(plan.pages.length).toBe(2);
    expect(plan.pages[0]?.items.map((i) => i.nodeId)).toEqual(['item-1']);
    expect(plan.pages[1]?.items.map((i) => i.nodeId)).toEqual(['item-2', 'item-3']);
  });
});
