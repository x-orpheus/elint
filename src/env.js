'use strict'

const debug = require('debug')('elint:env')
const path = require('path')
const isNpm = require('is-npm')

/**
 * 获取通过 npm script 执行时的项目根路径
 *
 * @returns {string} cwd
 */
/* istanbul ignore next */
function getInitCwd () {
  if (process.env.INIT_CWD) {
    debug(`process.env.INIT_CWD: ${process.env.INIT_CWD}`)
    return process.env.INIT_CWD
  }

  const cwd = process.cwd()

  debug(`process.cwd(): ${cwd}`)

  // 兼容 npm v3
  return cwd.split(`${path.sep}node_modules${path.sep}`)[0]
}

/**
 * 项目根目录
 *
 * @returns {string} base dir
 */
const getBaseDir = () => {
  /* istanbul ignore next */
  const baseDir = isNpm ? getInitCwd() : process.cwd()

  debug(`isNpm: ${isNpm}`)
  debug(`base dir: ${baseDir}`)

  return baseDir
}

/**
 * 项目的 node_modules 目录
 *
 * @returns {string} node_modules dir
 */
const getNodeModulesDir = () => {
  const nodeModulesDir = path.join(getBaseDir(), 'node_modules')

  debug(`node_modules dir: ${nodeModulesDir}`)
  return nodeModulesDir
}

module.exports = {
  getBaseDir,
  getNodeModulesDir
}
