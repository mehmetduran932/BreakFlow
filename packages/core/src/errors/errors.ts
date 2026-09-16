export class BreakFlowError extends Error {
  constructor(message: string, public readonly code: string = 'BREAKFLOW_ERROR') {
    super(`[BreakFlow] ${message}`);
    this.name = 'BreakFlowError';
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MeasurementError extends BreakFlowError {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message, 'MEASUREMENT_ERROR');
    this.name = 'MeasurementError';
  }
}

export class PaginationError extends BreakFlowError {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message, 'PAGINATION_ERROR');
    this.name = 'PaginationError';
  }
}

export class RendererError extends BreakFlowError {
  constructor(message: string, public readonly details?: Record<string, unknown>) {
    super(message, 'RENDERER_ERROR');
    this.name = 'RendererError';
  }
}

export class AssetTimeoutError extends BreakFlowError {
  constructor(message: string, public readonly timeoutMs: number) {
    super(`Asset loading timed out after ${timeoutMs}ms: ${message}`, 'ASSET_TIMEOUT_ERROR');
    this.name = 'AssetTimeoutError';
  }
}
