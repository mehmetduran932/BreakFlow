# Table Pagination & Multi-Page Geometry

## The Table Pagination Problem

HTML tables present unique difficulties during pagination:
1. **Row Slicing**: Browser native print engines frequently slice a table row (`<tr>`) horizontally across a page boundary, cutting text in half.
2. **Missing Headers**: When a table spans multiple pages, continuation pages lack `<thead>` headers, making data columns unreadable.
3. **Column Width Jumps**: Splitting table rows into new `<table>` elements usually causes the browser to recompute column widths based only on the rows present on that specific page.

## BreakFlow Table Strategy

BreakFlow contains a dedicated table pagination planner (`planTablePagination`) and DOM table slicer (`createTableSlice`).

### 1. Row Unit Preservation
Table rows are treated as atomic layout blocks. BreakFlow determines how many complete rows fit within the remaining vertical space of the active page. Rows are never cut midway.

### 2. Repeating `<thead>` Headers
If `repeatHeader: true` (the default in `smartDefaults`), BreakFlow extracts the `<thead>` element from the source table. For every continuation slice:
* The header height is factored into the available vertical page budget.
* A cloned `<thead>` is prepended to the sliced table on the new page.

### 3. Column Geometry Preservation
To avoid column width jumps between slices, BreakFlow:
* Measures the physical pixel width of every cell in the first row or header.
* Generates an explicit `<colgroup>` with corresponding `<col style="width: ...px">` elements for each slice.
* Enforces `table-layout: fixed` on the sliced table.

```html
<!-- Example Output Table Slice on Page 2 -->
<table class="breakflow-table-slice" style="table-layout: fixed;">
  <colgroup>
    <col style="width: 120px;">
    <col style="width: 380px;">
    <col style="width: 150px;">
  </colgroup>
  <thead>
    <!-- Cloned repeating header -->
  </thead>
  <tbody>
    <!-- Sliced rows for Page 2 -->
  </tbody>
</table>
```

### 4. Oversized Row Detection
If a single table row is taller than an entire page content height ($H_{\text{row}} > H_{\text{page}}$):
* The engine emits an `oversized-element` warning with row selector and measured height.
* The row is allocated its own page to avoid layout deadlocks.
