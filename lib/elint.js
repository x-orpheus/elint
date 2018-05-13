'use strict';

const path = require('path');
const { getPreset } = require('./preset');
const walker = require('./utils/walker');
const worker = require('./utils/worker');

/**
 * 主函数
 *
 * @param {string[]} files 待执行 lint 的文件
 * @param {string} presetName preset
 */
function elint(files, presetName) {
  // 没有指定文件，直接退出
  if (!files || !files.length) {
    process.exit();
  }

  const fileList = walker(files);
  const preset = getPreset(presetName);

  // 没有匹配到任何文件，直接退出
  if (!fileList.eslint.length && !fileList.stylelint.length) {
    process.exit();
  }

  if (!preset) {
    process.exit(1);
  }

  const eslintLinter = path.join(__dirname, 'linters/eslint.js');
  const stylelintLinter = path.join(__dirname, 'linters/stylelint.js');

  Promise.all([
    worker(eslintLinter, preset.eslint, ...fileList.eslint),
    worker(stylelintLinter, preset.stylelint, ...fileList.stylelint)
  ]).then(([eslintOutput, stylelintOutput]) => {
    console.log(eslintOutput.stdout);
    console.log(stylelintOutput.stdout);
  }).catch(error => {
    console.error(error);
  });
}

module.exports = elint;
