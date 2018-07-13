'use strict'

const semverUtils = require('semver-utils')

/**
 * 根据 package.json 中依赖的版本计算 install 的版本
 *
 * @param {string} rangeString package.json 依赖的版本
 * @returns {string} install 使用的版本
 */
function packageVersion (rangeString) {
  if (!rangeString || typeof rangeString !== 'string') {
    // 默认装 latest
    return 'latest'
  }

  const range = semverUtils.parseRange(rangeString)[0]
  const version = [
    range.major,
    range.minor,
    range.patch
  ].join('.')

  return range.release
    ? `${version}-${range.release}`
    : version
}

module.exports = packageVersion
