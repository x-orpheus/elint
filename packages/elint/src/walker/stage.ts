import _debug from 'debug'
import fs from 'fs-extra'
import mm from 'micromatch'
import sgf from 'staged-git-files'
import { intersection, without } from 'lodash-es'
import notStagedGitFiles from '../utils/not-staged-git-files'
import getStagedFileContent from '../utils/get-staged-file-content'
import type { FileItem } from '.'

const debug = _debug('elint:walker:stage')

const mmOptions: mm.Options = {
  dot: true,
  contains: true
}

/**
 * 执行 micromatch
 *
 * @param filename 文件名
 * @param patterns 匹配模式
 * @param ignorePatterns 忽略模式
 *
 * @returns 是否匹配
 */
function match(
  filename: string,
  patterns: string[],
  ignorePatterns: string[]
): boolean {
  function isMatch(ps: string[]) {
    return ps.some((p) => {
      return mm.isMatch(filename, p, mmOptions)
    })
  }

  let isIgnore = false

  if (Array.isArray(ignorePatterns) && ignorePatterns.length) {
    isIgnore = isMatch(ignorePatterns)
  }

  if (isIgnore) {
    return false
  }

  return isMatch(patterns)
}

/**
 * Git 暂存文件遍历
 *
 * @param patterns 要搜寻的 glob 数组
 * @param ignorePatterns 忽略的 glob 数组
 *
 * @returns file list
 */
function getStagedFileList(
  patterns: string[],
  ignorePatterns: string[],
  cwd: string
): Promise<string[]> {
  // 如果 baseDir 根本不存在 sgf 会抛出异常
  if (!fs.existsSync(cwd)) {
    return Promise.resolve([])
  }

  sgf.cwd = cwd

  return new Promise((resolve) => {
    sgf((err, result) => {
      if (err) {
        debug('staged-git-files error: %o', err)
        resolve([])
        return
      }

      const fileList = result
        .filter((item) => item.status !== 'Deleted') // 过滤已删除的文件
        .filter((item) => match(item.filename, patterns, ignorePatterns))
        .map((item) => item.filename)

      resolve(fileList)
    })
  })
}

/**
 * Git 暂存文件遍历
 *
 * @param patterns 要搜寻的 glob 数组
 * @param ignorePatterns 忽略的 glob 数组
 *
 * @returns file list
 */
async function stagedFiles(
  patterns: string[],
  ignorePatterns: string[],
  cwd: string
): Promise<FileItem[]> {
  // 暂存区文件
  const stagedFileList = await getStagedFileList(patterns, ignorePatterns, cwd)
  // 非暂存区文件
  const notStagedFileList = await notStagedGitFiles(cwd)

  // 交集，需要获取暂存区的内容
  const needGetContentFileList = intersection(stagedFileList, notStagedFileList)
  // 差级，只需要文件名
  const pureStagedFileList = without(stagedFileList, ...notStagedFileList)

  if (!needGetContentFileList.length) {
    return pureStagedFileList
  }

  const fileList: FileItem[] = [...pureStagedFileList]

  for (let i = 0, j = needGetContentFileList.length; i < j; i++) {
    const filePath = needGetContentFileList[i]
    const fileContent = await getStagedFileContent(filePath, cwd)

    if (fileContent !== null) {
      fileList.push({
        filePath,
        fileContent
      })
    }
  }

  return fileList
}

export default stagedFiles
