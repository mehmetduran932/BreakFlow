# BreakFlow Pagination Algorithm

## Overview

The BreakFlow pagination engine transforms a continuous layout hierarchy into a sequence of printable physical pages. It avoids naive "cut at page height" logic by evaluating semantic break candidates and calculating layout penalty costs.

## Algorithm Phases

### 1. Layout Tree Ingestion & Normalization
The engine receives measured `LayoutNode` objects from the browser measurement sandbox. Each node contains:
- `bounds`: Physical CSS pixel dimensions (`top`, `bottom`, `width`, `height`).
- `rules`: Active constraints (`keepTogether`, `keepWithNext`, `breakBefore`, `breakAfter`, `repeatHeader`).
- `type`: Semantic role (`heading`, `paragraph`, `table`, `figure`, `block`).

### 2. Candidate Evaluation & Greedy Scoring
The engine traverses nodes sequentially while tracking available vertical space on the current page:
$$H_{\text{available}} = H_{\text{page}} - H_{\text{current}}$$

For each candidate break point, the composite penalty cost is evaluated:
$$\text{Cost} = \text{RemainingWhitespace} \times W_{\text{whitespace}} + \sum \text{Penalties}$$

### 3. Penalty Flags & Default Weights

| Penalty | Default Weight | Trigger Condition |
| :--- | :--- | :--- |
| `keepTogetherViolation` | `100,000` | Slicing an element marked `keepTogether` |
| `tableRowSplit` | `100,000` | Slicing a `<tr>` midway across pages |
| `keepWithNextViolation` | `30,000` | Separating an element with `keepWithNext` from following node |
| `orphanHeading` | `20,000` | Heading isolated at the bottom of a page |
| `oversizedElement` | `50,000` | Single block taller than the entire page |
| `widow` | `10,000` | Fragmented line or trailing partial item |
| `whitespace` | `1` | Remaining unused height on the page |

*Forced breaks (`breakBefore`, `breakAfter`) return $-\infty$, ensuring immediate execution.*

### 4. Orphan Heading Prevention (`keepWithNext`)
When evaluating a node flagged as a heading (`h1-h6`) or with `keepWithNext`:
1. BreakFlow checks if the heading fits on the current page.
2. If it fits, BreakFlow inspects the *following* node.
3. If the following node *cannot* fit on the current page, but *can* fit on a fresh page, placing the heading alone would create an orphaned title at the bottom.
4. BreakFlow automatically moves the heading to the subsequent page together with its following content, recording a `prevent-orphan-heading` automatic fix.

### 5. Oversized Element Safety Degradation
If an element is taller than the total printable page height ($H_{\text{node}} > H_{\text{page}}$):
1. The engine recognizes that honoring `keepTogether` is mathematically impossible.
2. Rather than looping infinitely or generating blank pages, it emits an `oversized-element` warning.
3. If the element contains child blocks, BreakFlow degrades `keepTogether` and paginates its children across pages.
4. Loop iterations are strictly capped against `config.maxIterations` (default: 500) and `config.maxPages` (default: 200).

### 6. Post-Pagination Validation
After planning, the engine executes a validation pass over the generated pages:
- Validates that no physical overflow occurred ($H_{\text{content}} \le H_{\text{available}}$).
- Asserts that no trailing orphan headings exist on any page.
- Verifies that no empty or blank pages were created unnecessarily.

## Future Path: Global Optimal Pagination
The current greedy engine can be replaced by a dynamic-programming strategy:
$$\min \sum_{i=1}^{P} \text{PageCost}(p_i)$$
Because the strategy is defined behind the `PaginationStrategy` interface, global optimizers can be plugged in without refactoring measurement or rendering logic.
