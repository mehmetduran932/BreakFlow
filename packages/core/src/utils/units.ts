/**
 * CSS Physical Unit conversions (standard 96 DPI CSS reference pixel)
 * 1 inch = 96 CSS pixels = 25.4 millimeters
 */

export function mmToPx(mm: number, dpi = 96): number {
  return (mm * dpi) / 25.4;
}

export function inToPx(inches: number, dpi = 96): number {
  return inches * dpi;
}

export function ptToPx(pt: number, dpi = 96): number {
  return (pt * dpi) / 72;
}

export function pxToMm(px: number, dpi = 96): number {
  return (px * 25.4) / dpi;
}

export function parseLengthToPx(value: string | number | undefined, defaultVal = 0, dpi = 96): number {
  if (value === undefined || value === null) return defaultVal;
  if (typeof value === 'number') return value;

  const str = value.trim().toLowerCase();
  if (str.endsWith('px')) {
    return parseFloat(str) || defaultVal;
  }
  if (str.endsWith('mm')) {
    return mmToPx(parseFloat(str) || 0, dpi);
  }
  if (str.endsWith('cm')) {
    return mmToPx((parseFloat(str) || 0) * 10, dpi);
  }
  if (str.endsWith('in')) {
    return inToPx(parseFloat(str) || 0, dpi);
  }
  if (str.endsWith('pt')) {
    return ptToPx(parseFloat(str) || 0, dpi);
  }

  const num = parseFloat(str);
  return Number.isNaN(num) ? defaultVal : num;
}
