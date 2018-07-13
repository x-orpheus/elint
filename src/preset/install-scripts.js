'use strict'

const debug = require('debug')('elint:preset:install-scripts')
const path = require('path')
const tryRequire = require('../utils/try-require')
const { getNodeModulesDir } = require('../env')
const link = require('./link')

/**
 * install preset from npm scripts
 *
 * @param {string} [presetName] preset name
 * @returns {void}
 */
function install (presetName) {
  debug('run install from scripts, arguments: %o', arguments)

  const name = presetName || tryRequire(/elint-preset-/)[0]

  if (!name) {
    debug('can not fount preset, return')
    return
  }

  const nodeModulesDir = getNodeModulesDir()
  const keep = process.env.npm_config_keep || ''
  const presetModulePath = path.join(nodeModulesDir, name)

  link(presetModulePath, keep)
}

module.exports = install
