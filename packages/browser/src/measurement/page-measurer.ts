import type { ResolvedPageConfig } from '@breakflow/core';

export interface MeasuredPageDimensions {
  pageWidthPx: number;
  pageHeightPx: number;
  contentWidthPx: number;
  contentHeightPx: number;
  marginTopPx: number;
  marginBottomPx: number;
  marginLeftPx: number;
  marginRightPx: number;
}

export function measurePageDimensions(
  doc: Document,
  pageConfig: ResolvedPageConfig
): MeasuredPageDimensions {
  const testPage = doc.createElement('div');
  testPage.className = 'breakflow-page';
  testPage.style.position = 'absolute';
  testPage.style.top = '-10000px';
  testPage.style.left = '-10000px';
  testPage.style.width = pageConfig.width;
  testPage.style.height = pageConfig.height;
  testPage.style.boxSizing = 'border-box';
  testPage.style.visibility = 'hidden';

  const testContent = doc.createElement('div');
  testContent.className = 'breakflow-page-content';
  testContent.style.boxSizing = 'border-box';
  testContent.style.width = '100%';
  testContent.style.height = '100%';
  testContent.style.paddingTop = pageConfig.margin.top;
  testContent.style.paddingBottom = pageConfig.margin.bottom;
  testContent.style.paddingLeft = pageConfig.margin.left;
  testContent.style.paddingRight = pageConfig.margin.right;

  testPage.appendChild(testContent);
  doc.body.appendChild(testPage);

  const pageRect = testPage.getBoundingClientRect();
  const contentStyle = doc.defaultView ? doc.defaultView.getComputedStyle(testContent) : null;

  const paddingTop = contentStyle ? parseFloat(contentStyle.paddingTop) || 0 : 0;
  const paddingBottom = contentStyle ? parseFloat(contentStyle.paddingBottom) || 0 : 0;
  const paddingLeft = contentStyle ? parseFloat(contentStyle.paddingLeft) || 0 : 0;
  const paddingRight = contentStyle ? parseFloat(contentStyle.paddingRight) || 0 : 0;

  const contentWidthPx = Math.max(10, pageRect.width - paddingLeft - paddingRight);
  const contentHeightPx = Math.max(10, pageRect.height - paddingTop - paddingBottom);

  // Clean up
  testPage.remove();

  return {
    pageWidthPx: pageRect.width,
    pageHeightPx: pageRect.height,
    contentWidthPx,
    contentHeightPx,
    marginTopPx: paddingTop,
    marginBottomPx: paddingBottom,
    marginLeftPx: paddingLeft,
    marginRightPx: paddingRight
  };
}
