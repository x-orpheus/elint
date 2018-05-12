'use strict';

const walker = require('./utils/walker');
const { getPreset } = require('./preset');
const { linter } = require('./config');

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

  const fileList = walker(files, linter);

  const preset = getPreset(presetName);
  console.log(preset);
}

module.exports = elint;
