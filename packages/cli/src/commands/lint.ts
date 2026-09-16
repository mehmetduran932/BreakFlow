import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { analyzePdf } from '@breakflow/playwright';
import type { StandardPageFormat } from '@breakflow/core';
import { formatAnalysisTerminal, formatAnalysisJson } from '../formatters.js';

export interface LintCommandOptions {
  json?: boolean;
  selector?: string;
  format?: string;
  margin?: string;
  maxWarnings?: number;
  failOnWarning?: boolean;
}

export async function runLint(target: string, options: LintCommandOptions): Promise<void> {
  const isUrl = target.startsWith('http://') || target.startsWith('https://');
  let html: string | undefined;
  let url: string | undefined;

  if (isUrl) {
    url = target;
  } else {
    const fullPath = path.resolve(process.cwd(), target);
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      process.exit(1);
    }
    html = fs.readFileSync(fullPath, 'utf8');
  }

  const result = await analyzePdf({
    url,
    html,
    selector: options.selector || 'body',
    config: {
      page: {
        format: (options.format as StandardPageFormat) || 'A4',
        margin: options.margin || '15mm'
      }
    }
  });

  if (options.json) {
    console.log(formatAnalysisJson(result));
  } else {
    console.log(formatAnalysisTerminal(result, target));
  }

  const errors = result.issues.filter((i) => i.severity === 'error');
  const warnings = result.issues.filter((i) => i.severity === 'warning');

  let shouldFail = false;

  if (errors.length > 0) {
    shouldFail = true;
  }

  const maxWarn = options.maxWarnings !== undefined ? Number(options.maxWarnings) : (options.failOnWarning ? 0 : Infinity);
  if (warnings.length > maxWarn) {
    shouldFail = true;
  }

  if (shouldFail) {
    if (!options.json) {
      console.error(pc.bold(pc.red(`\n✖ Lint failed: Found ${errors.length} errors and ${warnings.length} warnings.\n`)));
    }
    process.exit(1);
  } else {
    if (!options.json) {
      console.log(pc.bold(pc.green('✔ Lint passed successfully.\n')));
    }
  }
}
