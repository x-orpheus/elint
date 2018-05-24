'use strict';

const walker = require('./utils/walker');
const report = require('./utils/report');
const eslint = require('./works/eslint');
const stylelint = require('./works/stylelint');

/**
 * 主函数
 *
 * @param {string[]} files 待执行 lint 的文件
 * @returns {void}
 */
function elint(files) {
  const fileList = walker(files);

  // 没有匹配到任何文件，直接退出
  if (!fileList.eslint.length && !fileList.stylelint.length) {
    process.exit();
  }

  Promise.all([
    eslint(...fileList.eslint),
    stylelint(...fileList.stylelint)
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
