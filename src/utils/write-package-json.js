'use strict'

const debug = require('debug')('elint:utils:writePackageJson')
const path = require('path')
const fs = require('fs-extra')
const lodash = require('lodash')
const writeJsonFile = require('write-json-file')
const sort = require('./sort-object')
const { getBaseDir } = require('../env')

/**
 * 将 devDependencies 写入 package.json
 *
 * @param {object} devDependencies 待写入的 devDependencies
 * @returns {Promise} Promise
 */
function writePackageJson (devDependencies) {
  debug('input devDependencies: %o', devDependencies)

  if (!lodash.isPlainObject(devDependencies)) {
    debug('devDependencies isn\'t plain object, return')
    // 不报错
    return Promise.resolve()
  }

  const baseDir = getBaseDir()
  const pkgPath = path.join(baseDir, 'package.json')

  debug(`package.json: ${pkgPath}`)

  if (!fs.existsSync(pkgPath)) {
    debug(`file not exists: ${pkgPath}, return`)
    return Promise.resolve()
  }

  let content

  try {
    content = JSON.parse(fs.readFileSync(pkgPath))
  } catch (error) {
    debug('parse package.json error')
    return Promise.resolve()
  }

  content.devDependencies = sort(Object.assign(
    {},
    content.devDependencies || {},
    devDependencies
  ))

  return writeJsonFile(pkgPath, content, {
    detectIndent: true
  })
}

module.exports = writePackageJson
