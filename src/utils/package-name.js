'use strict'

/**
 * package name 正则，支持 scope，version
 */
const packageNameRegexp = /^(?:@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(?:@.+)?$/

/**
 * @typedef ParsedPackageName
 * @property {string} name 包名
 * @property {string} [version] 版本
 * @property {string} [scope] scope
 */

/**
 * 解析 npm package name
 *
 * @param {string} packageName 包名
 * @returns {ParsedPackageName} parsed obj
 */
function parse (packageName) {
  if (!packageName || !packageNameRegexp.test(packageName)) {
    return null
  }

  const slashIndex = packageName.indexOf('/')
  const atLastIndex = packageName.lastIndexOf('@')
  const hasScope = slashIndex !== -1
  const hasVersion = atLastIndex !== -1 && atLastIndex !== 0

  let scope = ''
  let name = ''
  let version = ''

  if (hasScope && hasVersion) {
    scope = packageName.slice(1, slashIndex)
    name = packageName.slice(slashIndex + 1, atLastIndex)
    version = packageName.slice(atLastIndex + 1)
  } else if (hasScope) {
    scope = packageName.slice(1, slashIndex)
    name = packageName.slice(slashIndex + 1)
  } else if (hasVersion) {
    name = packageName.slice(slashIndex + 1, atLastIndex)
    version = packageName.slice(atLastIndex + 1)
  } else {
    name = packageName
  }

  return {
    name: normalize(name),
    scope,
    version
  }
}

/**
 * stringify
 *
 * @param {ParsedPackageName} parsedPackageName 解析过的 package name 对象
 * @returns {string} package name
 */
function stringify (parsedPackageName) {
  const { scope, version } = parsedPackageName
  let name = parsedPackageName.name

  if (scope) {
    name = `@${scope}/${name}`
  }

  if (version) {
    name = `${name}@${version}`
  }

  return name
}

/**
 * 标准化 presetName
 *
 * @param {string} [presetName] preset name
 * @returns {string} normalized presetName
 */
function normalize (presetName) {
  return !presetName || presetName.startsWith('elint-preset')
    ? presetName
    : `elint-preset-${presetName}`
}

module.exports = {
  parse,
  stringify,
  normalize
}
