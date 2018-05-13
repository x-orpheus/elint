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

  const eslintLinter = path.join(__dirname, 'linters/eslint.js');

  Promise.all([
    worker(eslintLinter, preset.eslint, ...fileList.eslint)
  ]).then(([eslintOutput]) => {
    console.log(eslintOutput.stdout);
  });
}

module.exports = elint;
