'use strict'

const debug = require('debug')('elint:utils:get-staged-file-content')
const execa = require('execa')
const { getBaseDir } = require('../env')

/**
 * 获取暂存区文件内容
 *
 * @param {string} filePath 文件路径
 * @returns {string} 文件内容
 */
function getStagedFileContent (filePath) {
  const baseDir = getBaseDir()

  return execa('git', ['show', `:${filePath}`], {
    cwd: baseDir,
    stripFinalNewline: false
  })
    .then(({ stdout }) => {
      return stdout
    })
    .catch(error => {
      debug('%O', error)
      return null
    })
}

module.exports = getStagedFileContent
