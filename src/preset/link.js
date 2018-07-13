'use strict'

const debug = require('debug')('elint:preset:link')
const findConfigFiles = require('./find-config-files')
const updateConfigFiles = require('./update-config-files')

/**
 * 把各种 lint 的配置文件，移动到根目录
 *
 * @param {string} presetModulePath preset module absolute path
 * @param {boolen} keep 是否保留旧配置文件
 * @returns {void}
 */
function link (presetModulePath, keep) {
  debug(`input ${presetModulePath}`)

  console.log('update config file:')

  findConfigFiles(presetModulePath)
    .forEach(configFilePath => {
      updateConfigFiles(configFilePath, keep)
    })
}

module.exports = link
