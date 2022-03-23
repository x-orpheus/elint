import _debug from 'debug'
import path from 'path'

const debug = _debug('elint:env')

/**
 * 项目根目录
 */
export const getBaseDir = (): string => {
  const baseDir = process.cwd()

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
