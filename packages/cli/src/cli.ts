import { Command } from 'commander';
import { runAnalyze } from './commands/analyze.js';
import { runLint } from './commands/lint.js';
import { runPdf } from './commands/pdf.js';

const program = new Command();

program
  .name('breakflow')
  .description('BreakFlow: Intelligent pagination for HTML and PDF.')
  .version('0.1.0');

program
  .command('analyze')
  .description('Analyze HTML pagination issues and metrics without modifying the document')
  .argument('<target>', 'HTML file path or HTTP(S) URL')
  .option('--json', 'Output machine-readable JSON for CI integration')
  .option('-s, --selector <selector>', 'Target element selector to paginate', 'body')
  .option('-f, --format <format>', 'Page format (A4, Letter, Legal, etc.)', 'A4')
  .option('-m, --margin <margin>', 'Page margin (e.g. 15mm, 1in, 20px)', '15mm')
  .action(async (target, options) => {
    try {
      await runAnalyze(target, options);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program
  .command('lint')
  .description('Lint HTML for severe pagination defects, orphan headings, and overflow')
  .argument('<target>', 'HTML file path or HTTP(S) URL')
  .option('--json', 'Output machine-readable JSON for CI integration')
  .option('-s, --selector <selector>', 'Target element selector to paginate', 'body')
  .option('-f, --format <format>', 'Page format (A4, Letter, Legal, etc.)', 'A4')
  .option('-m, --margin <margin>', 'Page margin (e.g. 15mm, 1in, 20px)', '15mm')
  .option('--max-warnings <number>', 'Maximum allowed warnings before failing')
  .option('--fail-on-warning', 'Fail with non-zero exit code on any warning')
  .action(async (target, options) => {
    try {
      await runLint(target, options);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program
  .command('pdf')
  .description('Intelligently paginate HTML and render a print-perfect PDF')
  .argument('<target>', 'HTML file path or HTTP(S) URL')
  .option('-o, --output <path>', 'Destination path for generated PDF')
  .option('-s, --selector <selector>', 'Target element selector to paginate', 'body')
  .option('-f, --format <format>', 'Page format (A4, Letter, Legal, etc.)', 'A4')
  .option('-m, --margin <margin>', 'Page margin (e.g. 15mm, 1in, 20px)', '15mm')
  .option('--debug', 'Embed visual pagination debug overlay into PDF')
  .option('-q, --quiet', 'Suppress diagnostic console output')
  .action(async (target, options) => {
    try {
      await runPdf(target, options);
    } catch (err) {
      console.error(err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program.parse(process.argv);
