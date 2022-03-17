import _debug from 'debug'
import path from 'node:path'
import { isNpmOrYarn } from 'is-npm'

const debug = _debug('elint:env')

/**
 * 获取通过 npm script 执行时的项目根路径
 */
/* istanbul ignore next */
function getInitCwd(): string {
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
 */
export const getBaseDir = (): string => {
  /* istanbul ignore next */
  const baseDir = isNpmOrYarn ? getInitCwd() : process.cwd()

  debug(`isNpmOrYarn: ${isNpmOrYarn}`)
  debug(`base dir: ${baseDir}`)

  return baseDir
}

/**
 * 项目的 node_modules 目录
 */
export const getNodeModulesDir = (): string => {
  const nodeModulesDir = path.join(getBaseDir(), 'node_modules')

  debug(`node_modules dir: ${nodeModulesDir}`)
  return nodeModulesDir
}
