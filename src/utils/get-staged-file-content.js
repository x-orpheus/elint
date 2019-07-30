const debug = require('debug')('elint:utils:get-staged-file-content')
const execa = require('execa')
const { getBaseDir } = require('../env')

module.exports = filePath => {
  const baseDir = getBaseDir()

  return execa('git', ['show', `:${filePath}`], { cwd: baseDir })
    .then(({ stdout }) => {
      return stdout
    })
    .catch(error => {
      debug('%O', error)
      return null
    })
}
