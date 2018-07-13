'use strict'

const debug = require('debug')('elint:walker:filetree')
const path = require('path')
const { linterSuffix } = require('../config')

/**
 * 获取 fileTree
 *
 * @returns {object} empty file tree
 */
function getFileTree () {
  const fileTree = {}

  debug('config linterSuffix: %o', linterSuffix)

  Object.keys(linterSuffix).forEach(linterName => {
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
  let extname

  fileList.forEach(filePath => {
    extname = path.extname(filePath)
    const linters = Object.keys(linterSuffix)

    const match = linters.some(linterName => {
      if (linterSuffix[linterName].includes(extname)) {
        fileTree[linterName].push(filePath)
        return true
      }

      return false
    })

    // 没有匹配到特定的 linter，则分配给所有 linter
    if (!match) {
      linters.forEach(linterName => {
        fileTree[linterName].push(filePath)
      })
    }
  })

  return fileTree
}

module.exports = {
  getFileTree,
  fillFileTree
}
