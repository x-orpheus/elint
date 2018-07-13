'use strict'

/**
 * 强制 stdio 同步输出
 * https://github.com/nodejs/node/issues/6456
 *
 * @param {boolean} blocking 是否同步
 * @returns {void}
 */
function setBlocking (blocking) {
  [process.stdout, process.stderr].forEach(stream => {
    /* istanbul ignore else */
    if (stream._handle && typeof stream._handle.setBlocking === 'function') {
      stream._handle.setBlocking(blocking)
    }
  })
}

module.exports = setBlocking
