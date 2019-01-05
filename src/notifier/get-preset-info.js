'use strict'

const debug = require('debug')('elint:notifier:getPresetInfo')
const path = require('path')
const url = require('url')
const fs = require('fs-extra')
const { getBaseDir } = require('../env')
const tryRequire = require('../utils/try-require')

function getRegistryUrl (resolved) {
  if (!resolved) {
    return ''
  }

  const resolvedUrl = new url.URL(resolved)

  return `${resolvedUrl.protocol}//${resolvedUrl.host}`
}

function getInfoFromPackageLock (presetName) {
  debug('get preset info from package-lock.json')

  const baseDir = getBaseDir()
  const lockPath = path.join(baseDir, 'package-lock.json')

  if (!fs.existsSync(lockPath)) {
    debug('package-lock.json not exist')
    return null
  }

  debug(`package-lock.json path: ${lockPath}`)

  const lockInfo = require(lockPath).dependencies[presetName]

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

function getPresetInfo () {
  const presetName = tryRequire(/elint-preset-/)[0]

  debug(`preset name: ${presetName}`)

  if (!presetName) {
    return null
  }

  const presetInfo = getInfoFromPackageLock(presetName) || getInfoFromNodeModules(presetName)

  debug('preset info: %o', presetInfo)

  // 数据不全
  if (!presetInfo.name || !presetInfo.version || !presetInfo.registryUrl) {
    return null
  }

  return presetInfo
}

module.exports = getPresetInfo
