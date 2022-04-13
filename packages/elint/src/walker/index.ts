import _debug from 'debug'
import type { ElintOptions } from '../types.js'
import { defaultIgnore } from '../config.js'
import local from './local.js'
import stage from './stage.js'

const debug = _debug('elint:walker')

export type FileItem =
  | string
  | {
      filePath: string
      fileContent: string
    }

type WalkerOptions = Pick<ElintOptions, 'noIgnore' | 'git'> & { cwd: string }

/**
 * 文件遍历
 *
 * @param patterns 匹配模式
 * @param options 配置
 * @returns file tree
 */
async function walker(
  patterns: string[],
  options: WalkerOptions
): Promise<FileItem[]> {
  debug(`input glob patterns: ${patterns}`)
  debug('input options: %o', options)

  if (!patterns || (Array.isArray(patterns) && !patterns.length)) {
    return Promise.resolve([])
  }

  const { noIgnore, git, cwd } = options

  debug(`run in git mode: ${git}`)

  /**
   * 根据运行环境执行不同的文件遍历策略
   */
  let fileList: FileItem[]
  let ignorePatterns: string[] = []

  if (!noIgnore) {
    debug('ignore rules: %j', defaultIgnore)
    ignorePatterns = defaultIgnore
  }

  if (git) {
    fileList = await stage(patterns, ignorePatterns, cwd)
  } else {
    fileList = await local(patterns, ignorePatterns, cwd)
  }

  debug('fileList: %o', fileList)

  debug(`files count: ${fileList.length}`)

  return fileList
}

export default walker
