'use strict'

const debug = require('debug')('elint:walker:filetree')
const path = require('path')
const { getBaseDir } = require('../env')
const { linterSuffix } = require('../config')

const linters = Object.keys(linterSuffix)

/**
 * 获取 fileTree
 *
 * @returns {object} empty file tree
 */
function getFileTree () {
  const fileTree = {}

  debug('config linterSuffix: %o', linterSuffix)

  linters.forEach(linterName => {
    fileTree[linterName] = []
  })

  return fileTree
}

/**
 * 填充 fileTree
 *
 * @param {object} fileTree file tree
 * @param {Array<string>} fileList file list
 * @returns {object} filled file tree
 */
function fillFileTree (fileTree, fileList) {
  const baseDir = getBaseDir()

  fileList.forEach(filePath => {
    const isString = typeof filePath === 'string'

    let extname
    let newFilePath

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

    const match = linters.some(linterName => {
      if (linterSuffix[linterName].includes(extname)) {
        fileTree[linterName].push(newFilePath)
        return true
      }

      return false
    })

    // 没有匹配到特定的 linter，则分配给所有 linter
    if (!match) {
      linters.forEach(linterName => {
        fileTree[linterName].push(newFilePath)
      })
    }
  })

  return fileTree
}

module.exports = {
  getFileTree,
  fillFileTree
}
