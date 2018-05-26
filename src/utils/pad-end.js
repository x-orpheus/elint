'use strict';

/**
 * polyfill String.prototype.padEnd
 *
 * @param {number} targetLength padding length
 * @returns {string} string
 */
/* istanbul ignore next */
function polyfill(targetLength) {
  const length = this.length;

  if (targetLength <= length) {
    return this;
  }

  return `${this}${' '.repeat(targetLength - length)}`;
}

/**
 * String.prototype.padEnd
 *
 * @param {string} string string
 * @param {number} targetLength padding length
 * @returns {string} string
 */
function padEnd(string, targetLength) {
  if (typeof string !== 'string'
    || typeof targetLength !== 'number') {
    return string;
  }

  const fn = typeof String.prototype.padEnd === 'function'
    ? String.prototype.padEnd
    /* istanbul ignore next */
    : polyfill;

  return fn.call(string, targetLength);
}

module.exports = padEnd;
