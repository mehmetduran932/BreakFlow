import type { ResolvedPageConfig } from '@breakflow/core';

export function generatePrintStyles(pageConfig: ResolvedPageConfig): string {
  const { width, height, margin } = pageConfig;

  return `
/* BreakFlow Print Normalization Styles */
@media print {
  @page {
    size: ${width} ${height};
    margin: 0;
  }
  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #fff !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

.breakflow-container {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.breakflow-page {
  box-sizing: border-box;
  width: ${width};
  height: ${height};
  position: relative;
  page-break-after: always;
  break-after: page;
  overflow: hidden;
  background: white;
}

.breakflow-page:last-child {
  page-break-after: auto;
  break-after: auto;
}

.breakflow-page-content {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding-top: ${margin.top};
  padding-right: ${margin.right};
  padding-bottom: ${margin.bottom};
  padding-left: ${margin.left};
  overflow: hidden;
}

.breakflow-table-slice {
  width: 100%;
  border-collapse: collapse;
}

/* Screen Preview / Presentation Mode */
@media screen {
  .breakflow-preview-mode .breakflow-page {
    margin: 20px auto;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
    border: 1px solid #e0e0e0;
  }
}
`;
}
