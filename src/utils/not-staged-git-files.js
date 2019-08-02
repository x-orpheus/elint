'use strict'

const debug = require('debug')('elint:not-staged-git-files')
const execa = require('execa')
const { getBaseDir } = require('../env')

/**
 * 获取没有添加到暂存区的文件
 *
 * @returns {Promise<string>} file list
 */
function notStagedGitFiles () {
  const baseDir = getBaseDir()

  return execa('git', ['diff', '--name-only'], {
    cwd: baseDir
  })
    .then(({ stdout }) => {
      const files = stdout ? stdout.split('\n') : []
      debug(files)
      return files
    })
    .catch(error => {
      debug('%O', error)
      return []
    })
}

module.exports = notStagedGitFiles
