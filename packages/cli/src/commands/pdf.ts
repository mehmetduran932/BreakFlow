import fs from 'node:fs';
import path from 'node:path';
import pc from 'picocolors';
import { generatePdf } from '@breakflow/playwright';
import type { StandardPageFormat } from '@breakflow/core';
import { formatAnalysisTerminal } from '../formatters.js';

export interface PdfCommandOptions {
  output?: string;
  selector?: string;
  format?: string;
  margin?: string;
  debug?: boolean;
  quiet?: boolean;
}

export function resolveDefaultOutputPath(target: string): string {
  if (target.startsWith('http://') || target.startsWith('https://')) {
    return path.resolve(process.cwd(), 'output.pdf');
  }
  const parsed = path.parse(target);
  return path.resolve(process.cwd(), `${parsed.name}.pdf`);
}

export async function runPdf(target: string, options: PdfCommandOptions): Promise<void> {
  const isUrl = target.startsWith('http://') || target.startsWith('https://');
  let html: string | undefined;
  let url: string | undefined;

  if (isUrl) {
    url = target;
  } else {
    const fullPath = path.resolve(process.cwd(), target);
    if (!fs.existsSync(fullPath)) {
      console.error(pc.red(`File not found: ${fullPath}`));
      process.exit(1);
    }
    html = fs.readFileSync(fullPath, 'utf8');
  }

  const outputPath = options.output
    ? path.resolve(process.cwd(), options.output)
    : resolveDefaultOutputPath(target);

  if (!options.quiet) {
    console.log(pc.cyan(`\nBreakFlow: Paginating and rendering PDF for ${pc.bold(target)}...`));
  }

  const result = await generatePdf({
    url,
    html,
    selector: options.selector || 'body',
    output: outputPath,
    config: {
      debug: options.debug ?? false,
      page: {
        format: (options.format as StandardPageFormat) || 'A4',
        margin: options.margin || '15mm'
      }
    }
  });

  if (!options.quiet) {
    console.log(formatAnalysisTerminal(result.result, target));
    console.log(pc.bold(pc.green(`✔ PDF successfully generated: ${pc.underline(outputPath)}`)));
    console.log(pc.dim(`  Pages: ${result.result.pageCount} | Size: ${(result.pdfBuffer.length / 1024).toFixed(1)} KB\n`));
  }
}
