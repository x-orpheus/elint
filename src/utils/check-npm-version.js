'use strict'

const fs = require('fs-extra')
const path = require('path')
const which = require('which')
const execa = require('execa')
const semver = require('semver')

/**
 * 获取 npm-lifecycle 版本
 *
 * @returns {string} npm-lifecycle version
 */
function getNpmLifecycleVersion () {
  const npmPath = which.sync('npm', {
    nothrow: true
  })

  if (!npmPath) {
    return ''
  }

  const pathSuffix = process.platform === 'win32'
    ? '../node_modules/npm/node_modules/npm-lifecycle/package.json'
    : '../../node_modules/npm-lifecycle/package.json'

  const lifecyclePkgPath = path.join(fs.realpathSync(npmPath), pathSuffix)

  if (!fs.existsSync(lifecyclePkgPath)) {
    return ''
  }

  // eslint-disable-next-line global-require
  return require(lifecyclePkgPath).version
}

/**
 * 检查 npm 版本
 *
 * npm 使用 npm-lifecycle 执行 hooks，但是某些版本存在 bug
 * https://github.com/npm/npm-lifecycle/pull/13/files
 *
 * 规则： npm-lifecycle 存在，且版本 < 2.0.2，报错并提示用户升级 npm，具体规则链接到 README
 */

const npmVersion = execa.sync('npm', ['-v']).stdout
const npmLifecycleVersion = getNpmLifecycleVersion()
let pass = true

/**
 * 检测到 npm-lifecycle 的时候（新版本都有），要求 npm-lifecycle >= 2.0.2
 * 检测不到 npm-lifecycle 的时候，要求 npm 不能在 5.1.0 ~ 6.1.0
 */
if (npmLifecycleVersion) {
  pass = semver.gte(npmLifecycleVersion, '2.0.2')
} else {
  pass = semver.satisfies(npmVersion, '<5.1.0 || >6.1.0')
}

module.exports = {
  npmVersion,
  npmLifecycleVersion,
  pass
}
