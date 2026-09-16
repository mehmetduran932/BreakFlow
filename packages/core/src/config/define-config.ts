import type {
  BreakFlowConfig,
  ResolvedBreakFlowConfig,
  ResolvedPaginationPenalties,
  ResolvedTableConfig
} from '../types/config.js';
import type { PageMargin, ResolvedPageConfig, ResolvedPageMargin } from '../types/page.js';
import { STANDARD_PAGE_SIZES } from '../types/page.js';

export function defineConfig(config: BreakFlowConfig = {}): BreakFlowConfig {
  return config;
}

function normalizeMarginValue(val: string | number | undefined, defaultVal: string): string {
  if (val === undefined) return defaultVal;
  if (typeof val === 'number') return `${val}px`;
  return String(val);
}

function resolveMargins(margin: string | number | PageMargin | undefined): ResolvedPageMargin {
  const defaultMargin = '15mm';
  if (!margin) {
    return { top: defaultMargin, right: defaultMargin, bottom: defaultMargin, left: defaultMargin };
  }
  if (typeof margin === 'string' || typeof margin === 'number') {
    const val = normalizeMarginValue(margin, defaultMargin);
    return { top: val, right: val, bottom: val, left: val };
  }
  return {
    top: normalizeMarginValue(margin.top, defaultMargin),
    right: normalizeMarginValue(margin.right, defaultMargin),
    bottom: normalizeMarginValue(margin.bottom, defaultMargin),
    left: normalizeMarginValue(margin.left, defaultMargin)
  };
}

export function resolvePageConfig(pageConfig: BreakFlowConfig['page'] = {}): ResolvedPageConfig {
  const format = pageConfig.format ?? (pageConfig.width ? undefined : 'A4');
  const orientation = pageConfig.orientation ?? 'portrait';
  const margin = resolveMargins(pageConfig.margin);

  let width: string;
  let height: string;

  if (format && STANDARD_PAGE_SIZES[format]) {
    const dims = STANDARD_PAGE_SIZES[format];
    if (orientation === 'landscape') {
      width = `${dims.heightMm}mm`;
      height = `${dims.widthMm}mm`;
    } else {
      width = `${dims.widthMm}mm`;
      height = `${dims.heightMm}mm`;
    }
  } else {
    width = pageConfig.width ? (typeof pageConfig.width === 'number' ? `${pageConfig.width}px` : pageConfig.width) : '210mm';
    height = pageConfig.height ? (typeof pageConfig.height === 'number' ? `${pageConfig.height}px` : pageConfig.height) : '297mm';
  }

  return {
    format,
    width,
    height,
    margin,
    orientation
  };
}

export function resolveConfig(config: BreakFlowConfig = {}): ResolvedBreakFlowConfig {
  const page = resolvePageConfig(config.page);

  const smartDefaults = config.smartDefaults ?? true;

  const defaultKeepTogether = smartDefaults
    ? ['figure', 'pre', 'blockquote', '[data-breakflow="keep"]', '[data-breakflow-keep]']
    : ['[data-breakflow="keep"]', '[data-breakflow-keep]'];

  const defaultKeepWithNext = smartDefaults
    ? ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', '[data-breakflow="keep-next"]', '[data-breakflow-keep-next]']
    : ['[data-breakflow="keep-next"]', '[data-breakflow-keep-next]'];

  const defaultBreakBefore = ['[data-breakflow="break-before"]', '[data-breakflow-break-before]'];
  const defaultBreakAfter = ['[data-breakflow="break-after"]', '[data-breakflow-break-after]'];

  const rules = {
    keepTogether: Array.from(new Set([...defaultKeepTogether, ...(config.rules?.keepTogether ?? [])])),
    keepWithNext: Array.from(new Set([...defaultKeepWithNext, ...(config.rules?.keepWithNext ?? [])])),
    breakBefore: Array.from(new Set([...defaultBreakBefore, ...(config.rules?.breakBefore ?? [])])),
    breakAfter: Array.from(new Set([...defaultBreakAfter, ...(config.rules?.breakAfter ?? [])]))
  };

  const table: ResolvedTableConfig = {
    repeatHeader: config.table?.repeatHeader ?? true,
    preventRowSplit: config.table?.preventRowSplit ?? true
  };

  const penalties: ResolvedPaginationPenalties = {
    keepTogether: config.penalties?.keepTogether ?? 100_000,
    tableRowSplit: config.penalties?.tableRowSplit ?? 100_000,
    keepWithNext: config.penalties?.keepWithNext ?? 30_000,
    orphanHeading: config.penalties?.orphanHeading ?? 20_000,
    widow: config.penalties?.widow ?? 10_000,
    oversizedElement: config.penalties?.oversizedElement ?? 50_000,
    whitespace: config.penalties?.whitespace ?? 1
  };

  return {
    page,
    smartDefaults,
    rules,
    table,
    penalties,
    maxIterations: config.maxIterations ?? 500,
    maxPages: config.maxPages ?? 200,
    logLevel: config.logLevel ?? 'warn',
    debug: config.debug ?? false
  };
}
