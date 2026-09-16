import type { BreakFlowLogger, LogLevel } from '../types/config.js';

const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4
};

export function createLogger(level: LogLevel = 'warn', custom?: BreakFlowLogger): BreakFlowLogger {
  if (custom) return custom;

  const threshold = LOG_LEVEL_SEVERITY[level] ?? 2;

  return {
    debug(msg: string, ...args: unknown[]) {
      if (threshold >= 4) {
        console.debug(`[BreakFlow:DEBUG] ${msg}`, ...args);
      }
    },
    info(msg: string, ...args: unknown[]) {
      if (threshold >= 3) {
        console.info(`[BreakFlow:INFO] ${msg}`, ...args);
      }
    },
    warn(msg: string, ...args: unknown[]) {
      if (threshold >= 2) {
        console.warn(`[BreakFlow:WARN] ${msg}`, ...args);
      }
    },
    error(msg: string, ...args: unknown[]) {
      if (threshold >= 1) {
        console.error(`[BreakFlow:ERROR] ${msg}`, ...args);
      }
    }
  };
}
