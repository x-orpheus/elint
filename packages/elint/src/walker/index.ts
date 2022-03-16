import _debug from 'debug'
import isGitHooks from '../utils/is-git-hooks'
import { defaultIgnore } from '../config'
import { getFileTree, fillFileTree, FilePath } from './file-tree'
import local from './local'
import stage from './stage'

const debug = _debug('elint:walker')

export interface WalkerOptions {
  /**
   * 是否禁用 ignore 规则
   *
   * @default `false`
   */
  noIgnore?: boolean
}

/**
 * 文件遍历
 *
 * @param patterns 匹配模式
 * @param options 配置
 * @returns {Promise<object>} file tree
 */
async function walker(patterns: string[], options: WalkerOptions = {}) {
  debug(`input glob patterns: ${patterns}`)
  debug('input options: %o', options)

  const fileTree = getFileTree()

  if (!patterns || (Array.isArray(patterns) && !patterns.length)) {
    return Promise.resolve(fileTree)
  }

  const isGit = await isGitHooks()

  debug(`run in git hooks: ${isGit}`)

  /**
   * 根据运行环境执行不同的文件遍历策略
   */
  let fileList: FilePath[]
  let ignorePatterns: string[] = []
  const { noIgnore = false } = options

  if (!noIgnore) {
    debug('ignore rules: %j', defaultIgnore)
    ignorePatterns = defaultIgnore
  }

  if (isGit) {
    fileList = await stage(patterns, ignorePatterns)
  } else {
    fileList = await local(patterns, ignorePatterns)
  }

  fillFileTree(fileTree, fileList)

  debug('fileList: %o', fileList)
  debug('fileTree: %o', fileTree)

  return fileTree
}

export default walker
