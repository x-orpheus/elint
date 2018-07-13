'use strict'

const debug = require('debug')('elint:preset:install-cli')
const os = require('os')
const fs = require('fs-extra')
const path = require('path')
const co = require('co')
const _ = require('lodash')
const npmInstall = require('../lib/npm-install')
const log = require('../utils/log')
const { parse, stringify } = require('../utils/package-name')
const packageVersion = require('../utils/package-version')
const writePkg = require('../utils/write-package-json')
const { registryAlias } = require('../config')
const link = require('./link')

/**
 * @typedef {Object} InstallOptions
 * @property {string} registry npm registry url & alias
 * @property {boolean} keep 是否保留原配置
 */

/**
 * 取 install 使用的 registry
 *
 * @param {string} registry registry url or alias
 * @returns {string} registry url
 */
function getRegistryUrl (registry) {
  return registryAlias[registry] || registry
}

/**
 * install preset from cli
 *
 * @param {string} presetName preset name
 * @param {InstallOptions} [options] install options
 * @returns {void}
 */
function install (presetName, options = {}) {
  debug('run install from cli, arguments: %o', arguments)

  /**
   * 处理 preset name
   */
  const parsedPresetName = parse(presetName)
  debug('parsed presetName object: %o', parsedPresetName)

  if (!parsedPresetName || !parsedPresetName.name) {
    log.error('请输入正确的 presetName.')
    process.exit(1)
  }

  const { name, scope, version } = parsedPresetName

  /**
   * 处理 options
   */
  const keep = options.keep || process.env.npm_config_keep || ''
  const registry = getRegistryUrl(
    options.registry || process.env.npm_config_registry || ''
  )

  // registryUrl 存在但是不合法
  if (registry && !/^https?:\/\//.test(registry)) {
    log.error('registry must be a full url with http(s)://')
    process.exit(1)
  }

  debug('parsed options: %o', { keep, registry })

  // 临时安装目录
  const tmpdir = path.join(os.tmpdir(), `elint_tmp_${Date.now()}`)
  const prestPackageName = stringify({ scope, name })
  const presetModulePath = process.platform === 'win32'
    ? path.join(tmpdir, `node_modules/${prestPackageName}`)
    : path.join(tmpdir, `lib/node_modules/${prestPackageName}`)
  const presetPkgPath = path.join(presetModulePath, 'package.json')

  debug(`tmpdir: ${tmpdir}`)
  debug(`preset module path: ${presetModulePath}`)
  debug(`preset package.json path: ${presetPkgPath}`)

  fs.ensureDirSync(tmpdir)

  co(function * () {
    /**
     * step1: 安装 preset
     */
    const installName = stringify({ scope, name, version })
    console.log(`install "${installName}"...`)

    yield npmInstall(installName, {
      prefix: tmpdir,
      registry
    })

    /**
     * step2: mv config file
     */
    link(presetModulePath, keep)

    // eslint-disable-next-line global-require
    const dependencies = require(presetPkgPath).dependencies
    if (!dependencies) {
      // 无需执行 step3, step4
      return
    }

    /**
     * step3: 修改 package.json
     *
     * 将 preset 的 dependencies 写入项目 package.json 的 devDependencies
     */
    console.log('save dependencies to package.json')
    writePkg(dependencies)

    /**
     * step4: 安装 preset 的 dependencies
     */
    console.log('install dependencies...')

    // 兼容 node v6
    const packages = _.toPairs(dependencies)
      .map(([name, range]) => {
        return `${name}@${packageVersion(range)}`
      })

    yield npmInstall(packages, {
      saveDev: true
    })

    // 清理临时目录
    fs.removeSync(tmpdir)
  }).catch(error => {
    log.error(error.message)
    process.exit(1)
  })
}

module.exports = install
