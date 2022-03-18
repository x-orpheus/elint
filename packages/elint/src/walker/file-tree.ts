import _debug from 'debug'
import path from 'path'
import { getBaseDir } from '../env'
import { LinterName, linterSuffix } from '../config'
const debug = _debug('elint:walker:file-tree')

const linters = Object.keys(linterSuffix) as LinterName[]

export type FilePath =
  | string
  | {
      fileName: string
      fileContent: string
    }

export type FileTree = Record<LinterName, FilePath[]>

/**
 * 获取 fileTree
 *
 * @returns empty file tree
 */
export function getFileTree() {
  const fileTree: Partial<FileTree> = {}

  debug('config linterSuffix: %o', linterSuffix)

  linters.forEach((linterName) => {
    fileTree[linterName] = []
  })

  return fileTree as FileTree
}

/**
 * 填充 fileTree
 *
 * @param fileTree file tree
 * @param fileList file list
 * @returns filled file tree
 */
export function fillFileTree(
  fileTree: FileTree,
  fileList: FilePath[]
): FileTree {
  const baseDir = getBaseDir()

  fileList.forEach((filePath) => {
    const isString = typeof filePath === 'string'

    let extname: string
    let newFilePath: FilePath

    if (isString) {
      extname = path.extname(filePath)
      newFilePath = path.join(baseDir, filePath)
    } else {
      extname = path.extname(filePath.fileName)
      newFilePath = {
        fileName: path.join(baseDir, filePath.fileName),
        fileContent: filePath.fileContent
      }
    }

    const match = linters.some((linterName) => {
      if ((linterSuffix[linterName] as string[]).includes(extname)) {
        fileTree[linterName].push(newFilePath)
        return true
      }

      return false
    })

    // 没有匹配到特定的 linter，则分配给所有 linter
    if (!match) {
      linters.forEach((linterName) => {
        fileTree[linterName].push(newFilePath)
      })
    }
  })

  return fileTree
}
