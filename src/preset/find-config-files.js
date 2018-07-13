'use strict'

const debug = require('debug')('elint:preset:findConfigFile')
const fs = require('fs-extra')
const path = require('path')
const { linterConfigFile } = require('../config')

/**
 * 在指定目录下搜寻全部配置文件
 *
 * @param {string} dir 绝对路径
 * @returns {Array<string>} 所有配置文件的路径
 */
function findConfigFiles (dir) {
  let result = []

  if (typeof dir !== 'string' || !fs.existsSync(dir)) {
    return result
  }

  const fileList = fs.readdirSync(dir)

  debug(`${dir} file list: %o`, fileList)

  result = linterConfigFile
    .filter(fileName => fileList.includes(fileName))
    .map(fileName => path.join(dir, fileName))

  debug('config file: %o', result)

  return result
}

module.exports = findConfigFiles
