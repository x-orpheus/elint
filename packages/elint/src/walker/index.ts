import _debug from 'debug'
import { ElintOptions } from '../elint'
import { defaultIgnore } from '../config'
import local from './local'
import stage from './stage'

const debug = _debug('elint:walker')

export type FileItem =
  | string
  | {
      filePath: string
      fileContent: string
    }

type WalkerOptions = Pick<ElintOptions, 'noIgnore' | 'git'>

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

  const { noIgnore, git } = options

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
    fileList = await stage(patterns, ignorePatterns)
  } else {
    fileList = await local(patterns, ignorePatterns)
  }

  debug('fileList: %o', fileList)

  return fileList
}

export default walker
