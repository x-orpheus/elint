'use strict';

const chalk = require('chalk');
const unicons = require('unicons');

/**
 * 按行缩进制定宽度
 */
function padding(string, span = 2) {
  const spaces = ' '.repeat(span);
  return spaces + string.replace(/\n/g, `\n${spaces}`);
}

/**
 * 多超过2个连续的换行合并为2个
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
    arr.push(`${unicons.cli('gear')} ${linterName} output:\n`);
    arr.push('\n');
    arr.push(padding(linterOutput));
    arr.push('\n');
  });

  console.log(reduceEmptyLine(arr.join('')));
}

module.exports = report;
