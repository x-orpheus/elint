'use strict';

const eslint = require('./linters/eslint');
const { getPreset } = require('./preset');
const walker = require('./utils/walker');

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

  const eslintOutput = eslint(fileList.eslint, preset.eslint);

  console.log(eslintOutput);
}

module.exports = elint;
