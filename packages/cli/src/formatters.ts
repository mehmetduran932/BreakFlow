import pc from 'picocolors';
import type { PaginationResult } from '@breakflow/core';

export function formatAnalysisTerminal(result: PaginationResult, target: string): string {
  const lines: string[] = [];

  lines.push(pc.bold(pc.cyan(`\nBreakFlow Analysis for: ${target}`)));
  lines.push(pc.dim('─'.repeat(50)));

  const errorCount = result.issues.filter((i) => i.severity === 'error').length;
  const warningCount = result.issues.filter((i) => i.severity === 'warning').length;
  const infoCount = result.issues.filter((i) => i.severity === 'info').length;

  lines.push(
    `Pages: ${pc.bold(result.pageCount)}  |  ` +
    `Errors: ${errorCount > 0 ? pc.red(errorCount) : pc.green(0)}  |  ` +
    `Warnings: ${warningCount > 0 ? pc.yellow(warningCount) : pc.green(0)}  |  ` +
    `Fixes Applied: ${pc.green(result.fixes.length)}`
  );
  lines.push('');

  if (result.issues.length === 0) {
    lines.push(pc.green('  ✔ No pagination issues detected. Document flows cleanly.'));
  } else {
    for (const issue of result.issues) {
      const pageTag = issue.page ? pc.magenta(`[Page ${issue.page}]`) : pc.magenta('[Doc]');
      const severityIcon =
        issue.severity === 'error'
          ? pc.red('✖ ERROR')
          : issue.severity === 'warning'
            ? pc.yellow('⚠ WARN')
            : pc.blue('ℹ INFO');

      const selectorTag = issue.selector ? pc.dim(` (${issue.selector})`) : '';
      lines.push(`  ${severityIcon} ${pageTag} ${issue.message}${selectorTag}`);
    }
  }

  if (result.fixes.length > 0) {
    lines.push(pc.bold('\nAutomatic Fixes Applied:'));
    for (const fix of result.fixes) {
      const pageInfo = fix.toPage ? pc.dim(` (moved to p.${fix.toPage})`) : '';
      lines.push(`  ${pc.green('✦')} ${fix.description}${pageInfo}`);
    }
  }

  lines.push(pc.dim(`\nCompleted in ${Math.round(result.metrics.totalMs)}ms (${result.metrics.measuredNodes} layout nodes measured)\n`));

  return lines.join('\n');
}

export function formatAnalysisJson(result: PaginationResult): string {
  return JSON.stringify(result, null, 2);
}
