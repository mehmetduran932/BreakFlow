import { describe, it, expect } from 'vitest';
import { ScoringEngine } from '../scoring/scoring-engine.js';
import { resolveConfig } from '../config/define-config.js';
import type { LayoutNode } from '../types/node.js';

describe('ScoringEngine', () => {
  const config = resolveConfig();
  const scoring = new ScoringEngine(config.penalties);

  const createMockNode = (props: Partial<LayoutNode>): LayoutNode => ({
    id: 'mock-1',
    selector: '.mock',
    tagName: 'div',
    type: 'block',
    bounds: { top: 0, bottom: 100, left: 0, right: 100, width: 100, height: 100 },
    breakable: true,
    rules: { keepTogether: false, keepWithNext: false, breakBefore: false, breakAfter: false },
    children: [],
    ...props
  });

  it('should calculate base whitespace cost when no penalties are present', () => {
    const cost = scoring.calculateBreakCost({
      id: 'c-1',
      index: 0,
      type: 'before-node',
      contentHeight: 800,
      remainingSpace: 200,
      forced: false,
      penalties: {
        orphanHeading: false,
        widow: false,
        keepTogetherViolation: false,
        keepWithNextViolation: false,
        tableRowSplit: false,
        oversizedElement: false
      }
    });

    expect(cost).toBe(200);
  });

  it('should return negative infinity for forced breaks', () => {
    const cost = scoring.calculateBreakCost({
      id: 'c-2',
      index: 1,
      type: 'forced-break',
      contentHeight: 500,
      remainingSpace: 500,
      forced: true,
      penalties: {
        orphanHeading: false,
        widow: false,
        keepTogetherViolation: false,
        keepWithNextViolation: false,
        tableRowSplit: false,
        oversizedElement: false
      }
    });

    expect(cost).toBe(Number.NEGATIVE_INFINITY);
  });

  it('should add high penalties for keepTogether and table row splits', () => {
    const cost = scoring.calculateBreakCost({
      id: 'c-3',
      index: 2,
      type: 'inside-node',
      contentHeight: 900,
      remainingSpace: 100,
      forced: false,
      penalties: {
        orphanHeading: false,
        widow: false,
        keepTogetherViolation: true,
        keepWithNextViolation: false,
        tableRowSplit: true,
        oversizedElement: false
      }
    });

    expect(cost).toBe(100 + 100_000 + 100_000);
  });

  it('should detect orphan heading penalty in evaluatePenaltyFlags', () => {
    const headingNode = createMockNode({
      tagName: 'h2',
      type: 'heading',
      rules: { keepTogether: false, keepWithNext: true, breakBefore: false, breakAfter: false }
    });

    const flags = scoring.evaluatePenaltyFlags(headingNode, undefined, 100, 1000);
    expect(flags.orphanHeading).toBe(true);
    expect(flags.keepWithNextViolation).toBe(true);
  });
});
