import { describe, it, expect } from 'vitest';
import { defineConfig, resolveConfig, resolvePageConfig } from '../config/define-config.js';

describe('Configuration', () => {
  it('should define and resolve default config', () => {
    const raw = defineConfig();
    const resolved = resolveConfig(raw);

    expect(resolved.page.format).toBe('A4');
    expect(resolved.page.width).toBe('210mm');
    expect(resolved.page.height).toBe('297mm');
    expect(resolved.page.margin.top).toBe('15mm');
    expect(resolved.smartDefaults).toBe(true);
    expect(resolved.table.repeatHeader).toBe(true);
    expect(resolved.table.preventRowSplit).toBe(true);
    expect(resolved.penalties.keepTogether).toBe(100_000);
    expect(resolved.rules.keepWithNext).toContain('h1');
    expect(resolved.rules.keepWithNext).toContain('h2');
    expect(resolved.rules.keepTogether).toContain('figure');
  });

  it('should support Letter format and custom margins', () => {
    const config = resolveConfig({
      page: {
        format: 'Letter',
        margin: { top: '20mm', bottom: '25mm', left: '10mm', right: '10mm' }
      },
      smartDefaults: false,
      rules: {
        keepTogether: ['.my-card']
      }
    });

    expect(config.page.format).toBe('Letter');
    expect(config.page.width).toBe('215.9mm');
    expect(config.page.height).toBe('279.4mm');
    expect(config.page.margin.top).toBe('20mm');
    expect(config.page.margin.bottom).toBe('25mm');
    expect(config.smartDefaults).toBe(false);
    expect(config.rules.keepTogether).toContain('.my-card');
  });

  it('should support landscape orientation', () => {
    const page = resolvePageConfig({
      format: 'A4',
      orientation: 'landscape'
    });

    expect(page.width).toBe('297mm');
    expect(page.height).toBe('210mm');
  });
});
