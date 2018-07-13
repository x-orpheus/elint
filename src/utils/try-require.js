'use strict'

const debug = require('debug')('elint:utils:try-require')
const path = require('path')
const fs = require('fs')
const { getNodeModulesDir } = require('../env')

/**
 * 获取全部目录下的模块
 *
 * @param {string} dir 目录
 * @param {string} [scope] scope
 * @returns {Array<string>} modules
 */
function getModulesByDir (dir, scope = '') {
  const nodeModulesDir = getNodeModulesDir()
  const results = []
  const modules = fs.readdirSync(dir)

  if (!modules.length) {
    return results
  }

  modules.forEach(module => {
    if (module.startsWith('.')) {

    } else if (module.startsWith('@')) {
      const subDir = path.join(nodeModulesDir, module)
      const subModules = getModulesByDir(subDir, module)
      Array.prototype.push.call(results, ...subModules)
    } else {
      results.push(scope ? `${scope}/${module}` : module)
    }
  })

  return results
}

/**
 * 尝试获取已安装的模块，返回模块名
 *
 * @param {RegExp} regexp 正则，描述要 require 的 mudule
 * @returns {string[]} 所有匹配的模块名
 */
function tryRequire (regexp) {
  const nodeModulesDir = getNodeModulesDir()
  const results = []

  debug(`arguments.regexp: ${regexp || 'undefined'}`)

  if (!regexp || !fs.existsSync(nodeModulesDir)) {
    debug('regexp is undefined or nodeModulesDir not exists')
    return results
  }

  const moduleList = getModulesByDir(nodeModulesDir)
    .filter(m => regexp.test(m))

  debug(`matched modules: ${moduleList.join(', ')}`)

  return moduleList
}

module.exports = tryRequire
