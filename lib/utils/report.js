'use strict';

const chalk = require('chalk');

/**
 * 按行（每行）缩进指定宽度
 */
function padding(string, span = 2) {
  const spaces = ' '.repeat(span);
  return spaces + string.replace(/\n/g, `\n${spaces}`);
}

/**
 * 移除多余的空行
 * 连续两个以上的 \n 合并为两个
 */
function reduceEmptyLine(string) {
  return string.replace(/\n([ ]*\n)+/g, '\n\n');
}

/**
 * report
 */
function report(output) {
  const arr = [];

  Object.entries(output).forEach(([linterName, linterOutput]) => {
    if (!linterOutput || !linterOutput.trim()) {
      return;
    }

    arr.push('\n');
    arr.push(`${chalk.bold(`> ${linterName} output:`)}\n`);
    arr.push('\n');
    arr.push(padding(linterOutput));
    arr.push('\n');
  });

  arr.push('\n');

  console.log(reduceEmptyLine(arr.join('')));
}

module.exports = report;
