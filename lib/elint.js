'use strict';

const path = require('path');
const walker = require('./utils/walker');
const worker = require('./utils/worker');
const report = require('./utils/report');

/**
 * 主函数
 *
 * @param {string[]} files 待执行 lint 的文件
 * @returns {void}
 */
function elint(files) {
  // 没有指定文件，直接退出
  if (!files || !files.length) {
    process.exit();
  }

  const fileList = walker(files);

  // 没有匹配到任何文件，直接退出
  if (!fileList.eslint.length && !fileList.stylelint.length) {
    process.exit();
  }

  const eslintLinter = path.join(__dirname, 'linters/eslint.js');
  const stylelintLinter = path.join(__dirname, 'linters/stylelint.js');

  Promise.all([
    worker(eslintLinter, ...fileList.eslint),
    worker(stylelintLinter, ...fileList.stylelint)
  ]).then(([eslintOutput, stylelintOutput]) => {
    report({
      eslint: eslintOutput.stdout,
      stylelint: stylelintOutput.stdout
    });
  }).catch(error => {
    console.error(error);
  });
}

module.exports = elint;
