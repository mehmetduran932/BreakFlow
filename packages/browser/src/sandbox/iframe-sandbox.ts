import type { ResolvedPageConfig } from '@breakflow/core';
import { generatePrintStyles } from '../styles/print-styles.js';
import { waitForAssets } from '../assets/asset-waiter.js';

export interface SandboxEnvironment {
  iframe: HTMLIFrameElement;
  doc: Document;
  container: HTMLElement;
  cleanup: () => void;
}

export async function createIsolatedSandbox(
  sourceElement: HTMLElement,
  pageConfig: ResolvedPageConfig
): Promise<SandboxEnvironment> {
  const parentDoc = sourceElement.ownerDocument || document;

  // Create isolated iframe matching exact page dimensions
  const iframe = parentDoc.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '-99999px';
  iframe.style.width = pageConfig.width;
  iframe.style.height = pageConfig.height;
  iframe.style.border = 'none';
  iframe.style.opacity = '0';
  iframe.style.pointerEvents = 'none';
  iframe.setAttribute('aria-hidden', 'true');
  iframe.setAttribute('tabindex', '-1');

  parentDoc.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    iframe.remove();
    throw new Error('[BreakFlow] Unable to access isolated sandbox document in iframe.');
  }

  // Copy stylesheets and style tags from parent document
  const styleNodes = Array.from(parentDoc.querySelectorAll('style, link[rel="stylesheet"]'));
  for (const node of styleNodes) {
    iframeDoc.head.appendChild(node.cloneNode(true));
  }

  // Inject BreakFlow normalization styles
  const printStyle = iframeDoc.createElement('style');
  printStyle.id = 'breakflow-injected-styles';
  printStyle.textContent = generatePrintStyles(pageConfig);
  iframeDoc.head.appendChild(printStyle);

  // Create measurement container inside iframe configured to exact printable content dimensions
  const container = iframeDoc.createElement('div');
  container.className = 'breakflow-container';
  container.id = 'breakflow-sandbox-root';
  container.style.boxSizing = 'border-box';
  container.style.width = '100%';
  container.style.paddingTop = pageConfig.margin.top;
  container.style.paddingRight = pageConfig.margin.right;
  container.style.paddingBottom = pageConfig.margin.bottom;
  container.style.paddingLeft = pageConfig.margin.left;

  // Deep clone the source element into the sandbox
  const clonedTarget = sourceElement.cloneNode(true) as HTMLElement;
  clonedTarget.style.maxWidth = '100%';
  clonedTarget.style.boxSizing = 'border-box';
  container.appendChild(clonedTarget);
  iframeDoc.body.appendChild(container);

  // Wait for fonts and images in the sandbox document to settle
  await waitForAssets(iframeDoc);

  const cleanup = () => {
    try {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    } catch {
      // Ignore if already removed
    }
  };

  return {
    iframe,
    doc: iframeDoc,
    container,
    cleanup
  };
}
