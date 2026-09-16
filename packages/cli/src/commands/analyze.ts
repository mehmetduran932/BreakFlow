import fs from 'node:fs';
import path from 'node:path';
import { analyzePdf } from '@breakflow/playwright';
import type { StandardPageFormat } from '@breakflow/core';
import { formatAnalysisTerminal, formatAnalysisJson } from '../formatters.js';

export interface AnalyzeCommandOptions {
  json?: boolean;
  selector?: string;
  format?: string;
  margin?: string;
}

export async function runAnalyze(target: string, options: AnalyzeCommandOptions): Promise<void> {
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
}
