import _debug from 'debug'
import path from 'path'

const debug = _debug('elint:env')

/**
 * 项目根目录
 */
/* istanbul ignore next */
export const getBaseDir = (): string => {
  // for unit test
  if (process.env.INIT_CWD) {
    debug(`process.env.INIT_CWD: ${process.env.INIT_CWD}`)
    return process.env.INIT_CWD
  }

  const baseDir = process.cwd()

  debug(`base dir: ${baseDir}`)

  return baseDir
}

/**
 * 项目的 node_modules 目录
 */
export const getNodeModulesDir = (baseDir?: string): string => {
  const nodeModulesDir = path.join(baseDir || getBaseDir(), 'node_modules')

  debug(`node_modules dir: ${nodeModulesDir}`)
  return nodeModulesDir
}
