'use strict';

const { getPreset } = require('./preset');

/**
 * 主函数
 *
 * @param {string[]} files 待执行 lint 的文件
 * @param {string} presetName preset
 */
function elint(files, presetName) {
  if (!files || !files.length) {
    process.exit();
  }

  const preset = getPreset(presetName);

  console.log(preset);
}

module.exports = elint;
