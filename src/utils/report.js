'use strict';

const chalk = require('chalk');

/**
 * 按行（每行）缩进指定宽度
 *
 * @param {string} string 要操作的字符串
 * @param {number} [span=2] 缩进
 * @returns {string} 处理后的文本
 */
function padding(string, span = 2) {
  const spaces = ' '.repeat(span);
  return spaces + string.replace(/\n/g, `\n${spaces}`);
}

/**
 * 移除多余的空行
 * 连续两个以上的 \n 合并为两个
 *
 * @param {string} string 要操作的字符串
 * @returns {string} 处理后的文本
 */
function reduceEmptyLine(string) {
  return string.replace(/\n([ ]*\n)+/g, '\n\n');
}

/**
 * @typedef Output
 * @property {string} name 段落名
 * @property {string} content 段落内容
 */

/**
 * report
 *
 * @param {Output[]} outputs 要输出到命令行的内容
 * @returns {void}
 */
function report(outputs) {
  const arr = [];

  outputs.forEach(output => {
    const name = output.name;
    const content = output.output;

    arr.push('\n');
    arr.push(`${chalk.bold(`> ${name}:`)}\n`);
    arr.push('\n');
    arr.push(padding(content));
    arr.push('\n');
  });

  arr.push('\n');

  console.log(reduceEmptyLine(arr.join('')));
}

module.exports = report;
