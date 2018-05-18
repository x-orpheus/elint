'use strict';

const debug = require('debug')('elint:utils:preset');

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

module.exports = normalize;
