import { AssetTimeoutError } from '@breakflow/core';

export interface AssetWaitOptions {
  timeoutMs?: number;
  throwOnTimeout?: boolean;
}

export async function waitForAssets(
  doc: Document,
  options: AssetWaitOptions = {}
): Promise<{ loadedImages: number; timedOut: boolean }> {
  const timeoutMs = options.timeoutMs ?? 8000;
  const throwOnTimeout = options.throwOnTimeout ?? false;

  let timedOut = false;

  // 1. Wait for Fonts
  const fontPromise = doc.fonts ? doc.fonts.ready : Promise.resolve();

  // 2. Wait for Images
  const imgElements = Array.from(doc.querySelectorAll<HTMLImageElement>('img'));

  const imgPromises = imgElements.map((img) => {
    // If lazy loading is set, convert to eager so browser loads it in sandbox
    if (img.loading === 'lazy') {
      img.loading = 'eager';
    }

    if (img.complete && img.naturalWidth !== 0) {
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      const cleanup = () => {
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      };

      const onLoad = () => {
        cleanup();
        resolve();
      };

      const onError = () => {
        cleanup();
        // Resolve even on error so one missing image doesn't block entire pagination
        resolve();
      };

      img.addEventListener('load', onLoad);
      img.addEventListener('error', onError);
    });
  });

  const allAssetsPromise = Promise.all([fontPromise, ...imgPromises]);

  const timeoutPromise = new Promise<'timeout'>((resolve) => {
    setTimeout(() => resolve('timeout'), timeoutMs);
  });

  const result = await Promise.race([
    allAssetsPromise.then(() => 'loaded' as const),
    timeoutPromise
  ]);

  if (result === 'timeout') {
    timedOut = true;
    if (throwOnTimeout) {
      throw new AssetTimeoutError(`Images or web fonts did not settle in ${timeoutMs}ms`, timeoutMs);
    }
  }

  return {
    loadedImages: imgElements.length,
    timedOut
  };
}
