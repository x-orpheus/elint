import _debug from 'debug'
import path from 'node:path'
import fs from 'node:fs'
import { getNodeModulesDir } from '../env.js'

const debug = _debug('elint:utils:try-require')

/**
 * 获取全部目录下的模块
 *
 * @param dir 目录
 * @param scope
 * @returns modules
 */
function getModulesByDir(dir: string, scope = ''): string[] {
  const results: string[] = []
  const modules = fs.readdirSync(dir)

  if (!modules.length) {
    return results
  }

  modules.forEach((module) => {
    if (module.startsWith('.')) {
      // do nothing
    } else if (module.startsWith('@')) {
      const subDir = path.join(dir, module)
      const subModules = getModulesByDir(subDir, module)
      results.push(...subModules)
    } else {
      results.push(scope ? `${scope}/${module}` : module)
    }
  })

  return results
}

/**
 * 尝试获取已安装的模块，返回模块名
 *
 * @param pattern 正则，描述要 require 的 module
 * @param baseDir 查找模块的基础路径
 * @returns 所有匹配的模块名
 */
function tryRequire(pattern: RegExp, baseDir?: string): string[] {
  const nodeModulesDir = getNodeModulesDir(baseDir)
  const results: string[] = []

  debug(`pattern: ${pattern}`)

  if (!fs.existsSync(nodeModulesDir)) {
    debug('pattern is undefined or nodeModulesDir not exists')
    return results
  }

  const moduleList = getModulesByDir(nodeModulesDir).filter((m) =>
    pattern.test(m)
  )

  debug(`matched modules: ${moduleList.join(', ')}`)

  return moduleList
}

export default tryRequire
