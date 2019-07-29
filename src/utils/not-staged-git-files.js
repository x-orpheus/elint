'use strict'

const debug = require('debug')('elint:not-staged-git-files')
const execa = require('execa')
const { getBaseDir } = require('../env')

module.exports = () => {
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
      debug(error)
      return []
    })
}
