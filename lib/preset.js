'use strict';

const debug = require('debug')('elint:utils:preset');
const path = require('path');
const tryRequire = require('./utils/tryRequire');
const { nodeModulesDir } = require('./utils/env');

/**
 * 标准化 presetName
 *
 * @param {string} [presetName]
 * @returns {string} normalized presetName
 */
function normalize(presetName) {
  if (!presetName) {
    debug('No preset provided');
    return presetName;
  }

  const normalizePresetName = presetName.startsWith('elint-preset')
    ? presetName
    : `elint-preset-${presetName}`;

  debug(`normalize preset name: ${normalizePresetName}`);

  return normalizePresetName;
}

/**
 * 验证 preset
 *
 * @param {string} presetName
 * @returns {boolean}
 */
function verify(presetName) {
  const presetModules = tryRequire(/^elint\-preset\-\w+$/);

  debug(`installed preset list: ${presetModules.join(', ')}`);

  if (!presetModules.length || (!presetName && presetModules.length > 1)) {
    console.error('请指定 preset!');
    return false;
  }

  const targetPreset = presetModules.find(m => m === presetName);

  debug(`matched preset: ${targetPreset}`);

  if (!targetPreset) {
    console.error(`找不到 preset: ${presetName}!`);
    return false;
  }

  return true;
}

/**
 * 获取 prest
 *
 * @param {string} [presetName]
 * @returns {null | Object}
 */
function getPreset(presetName) {
  const normalizePresetName = normalize(presetName);

  if (!verify(normalizePresetName)) {
    return null;
  }

  const presetPath = path.join(nodeModulesDir, normalizePresetName);

  debug(`matched preset absolute path: ${presetPath}`);

  return require(presetPath);
}

module.exports = {
  normalize,
  verify,
  getPreset
};
