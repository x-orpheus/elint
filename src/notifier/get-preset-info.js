'use strict'

const debug = require('debug')('elint:notifier:getPresetInfo')
const path = require('path')
const url = require('url')
const _ = require('lodash')
const fs = require('fs-extra')
const { getBaseDir } = require('../env')
const tryRequire = require('../utils/try-require')

/**
 * @typedef PresetInfo
 * @property {stirng} name preset 名称
 * @property {stirng} version 版本
 * @property {stirng} registryUrl 仓库地址
 */

/**
 * 从 registry 中解析出仓库地址
 *
 * @param {string} resolved package.json 或 package-lock.json 中的 resolved 字段
 * @returns {string} 解析后的 registry 地址
 */
function getRegistryUrl (resolved) {
  if (!resolved) {
    return ''
  }

  let resolvedUrl = ''

  try {
    const urlObj = new url.URL(resolved)
    resolvedUrl = `${urlObj.protocol}//${urlObj.host}`
  } catch (error) {
    debug('url parse error: %o', error)
  }

  return resolvedUrl
}

/**
 * 从 package-lock.json 中获取 preset 信息
 *
 * @param {string} presetName preset name
 * @returns {null|PresetInfo} 结果
 */
function getInfoFromPackageLock (presetName) {
  debug('get preset info from package-lock.json')

  const baseDir = getBaseDir()
  const lockPath = path.join(baseDir, 'package-lock.json')

  if (!fs.existsSync(lockPath)) {
    debug('package-lock.json not exist')
    return null
  }

  debug(`package-lock.json path: ${lockPath}`)

  const lockInfo = _.get(require(lockPath), `dependencies.${presetName}`)

  debug('lock info: %o', lockInfo)

  if (!lockInfo) {
    return null
  }

  return {
    name: presetName,
    version: lockInfo.version,
    registryUrl: getRegistryUrl(lockInfo.resolved)
  }
}

/**
 * 从 node_modules 中获取 preset 信息
 *
 * @param {string} presetName preset name
 * @returns {null|PresetInfo} 结果
 */
function getInfoFromNodeModules (presetName) {
  debug('get preset info from node_modules')

  const baseDir = getBaseDir()
  const packagePath = path.join(baseDir, 'node_modules', presetName, 'package.json')

  if (!fs.existsSync(packagePath)) {
    debug('package not exist')
    return null
  }

  debug(`package.json path: ${packagePath}`)

  const packageInfo = require(packagePath)

  debug('package info: %o', packageInfo)

  return {
    name: presetName,
    version: packageInfo.version,
    registryUrl: getRegistryUrl(packageInfo._resolved)
  }
}

/**
 * 获取 preset 信息
 *
 * @param {string} presetName preset name
 * @returns {null|PresetInfo} 结果
 */
function getPresetInfo () {
  const presetName = tryRequire(/elint-preset-/)[0]

  debug(`preset name: ${presetName}`)

  if (!presetName) {
    return null
  }

  const presetInfo = getInfoFromPackageLock(presetName) || getInfoFromNodeModules(presetName)

  debug('preset info: %o', presetInfo)

  // 数据不全
  if (!presetInfo || !presetInfo.name || !presetInfo.version || !presetInfo.registryUrl) {
    return null
  }

  return presetInfo
}

module.exports = getPresetInfo
