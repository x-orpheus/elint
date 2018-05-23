'use strict';

const debug = require('debug')('elint:preset:normalize');

/**
 * 标准化 presetName
 *
 * @param {string} [presetName]
 * @param {string} [scope]
 * @returns {string} normalized presetName
 */
function normalize(presetName, scope) {
  if (!presetName) {
    debug('No preset provided');
    return presetName;
  }

  // 处理 scope
  let scopePrefix = '';
  if (scope) {
    scopePrefix = scope + '/';
  }

  const normalizePresetName = presetName.startsWith('elint-preset')
    ? `${scopePrefix}${presetName}`
    : `${scopePrefix}elint-preset-${presetName}`;

  debug(`normalize preset name: ${normalizePresetName}`);

  return normalizePresetName;
}

module.exports = normalize;
