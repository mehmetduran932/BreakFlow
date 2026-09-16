import type { BreakCandidate, BreakPenaltyFlags } from '../types/candidate.js';
import type { ResolvedPaginationPenalties } from '../types/config.js';
import type { LayoutNode } from '../types/node.js';

export class ScoringEngine {
  constructor(private readonly penalties: ResolvedPaginationPenalties) {}

  /**
   * Calculates the penalty flags for a break occurring between or inside nodes.
   */
  public evaluatePenaltyFlags(
    precedingNode: LayoutNode | undefined,
    followingNode: LayoutNode | undefined,
    remainingSpace: number,
    pageContentHeight: number,
    isTableRowSplit = false
  ): BreakPenaltyFlags {
    let orphanHeading = false;
    let keepWithNextViolation = false;
    let keepTogetherViolation = false;
    let widow = false;
    let oversizedElement = false;

    if (precedingNode) {
      // Check if preceding node is a heading or has keepWithNext rule
      const isHeading =
        precedingNode.type === 'heading' ||
        ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(precedingNode.tagName.toLowerCase());

      if (precedingNode.rules.keepWithNext || isHeading) {
        keepWithNextViolation = true;
        if (isHeading) {
          orphanHeading = true;
        }
      }

      // If preceding node was sliced midway without breakable or forced
      if (precedingNode.rules.keepTogether && precedingNode.bounds.height > 0) {
        // If it was forced to split because it's taller than page
        if (precedingNode.bounds.height > pageContentHeight) {
          oversizedElement = true;
        }
      }
    }

    // Widow check: if tiny whitespace or single short element left
    if (remainingSpace > 0 && remainingSpace < pageContentHeight * 0.05) {
      // Slight widow risk
      widow = false;
    }

    return {
      orphanHeading,
      widow,
      keepTogetherViolation,
      keepWithNextViolation,
      tableRowSplit: isTableRowSplit,
      oversizedElement
    };
  }

  /**
   * Computes the numeric cost for a break candidate.
   * Lower cost is better. Forced breaks return Number.NEGATIVE_INFINITY.
   */
  public calculateBreakCost(candidate: Omit<BreakCandidate, 'cost'>): number {
    if (candidate.forced) {
      return Number.NEGATIVE_INFINITY;
    }

    let cost = Math.max(0, candidate.remainingSpace) * this.penalties.whitespace;

    if (candidate.penalties.keepTogetherViolation) {
      cost += this.penalties.keepTogether;
    }

    if (candidate.penalties.tableRowSplit) {
      cost += this.penalties.tableRowSplit;
    }

    if (candidate.penalties.keepWithNextViolation) {
      cost += this.penalties.keepWithNext;
    }

    if (candidate.penalties.orphanHeading) {
      cost += this.penalties.orphanHeading;
    }

    if (candidate.penalties.widow) {
      cost += this.penalties.widow;
    }

    if (candidate.penalties.oversizedElement) {
      cost += this.penalties.oversizedElement;
    }

    return cost;
  }
}
