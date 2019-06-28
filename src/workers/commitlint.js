'use strict'

const debug = require('debug')('elint:workers:commitlint')
const fs = require('fs-extra')
const path = require('path')
const {
  format: commitlintFormat,
  load: commitlintLoad,
  lint: commitlintLint,
  read: commitlintRead
} = require('@commitlint/core')
const log = require('../utils/log')
const loadESModule = require('../utils/load-esmodule')
const { getBaseDir } = require('../env')

const format = loadESModule(commitlintFormat)
const load = loadESModule(commitlintLoad)
const lint = loadESModule(commitlintLint)
const read = loadESModule(commitlintRead)

/**
 * run commitlint
 *
 * @returns {void}
 */
async function commitlint () {
  const baseDir = getBaseDir()

  try {
    const readOptions = {
      cwd: baseDir,
      edit: '.git/COMMIT_EDITMSG'
    }

    debug('commitlint.read options: %o', readOptions)

    const gitMsgFilePath = path.join(readOptions.cwd, readOptions.edit)

    if (!fs.existsSync(gitMsgFilePath)) {
      debug(`can not found "${gitMsgFilePath}"`)
      throw new Error('无法读取 git commit 信息')
    }

    const [message, config] = await Promise.all([read(readOptions), load()])

    debug('git commit message: %o', message)
    debug('commitlint config: %o', config)

    const rules = config.rules
    const options = config.parserPreset ? { parserOpts: config.parserPreset.parserOpts } : {}
    const report = await lint(message[0], rules, options)
    const formatted = format({
      results: [report]
    })

    console.log()
    console.log(Array.isArray(formatted) ? formatted.join('\n') : formatted)
    console.log()

    process.exit(report.errors.length ? 1 : 0)
  } catch (error) {
    log.error(error.message)
    process.exit(1)
  }
}

module.exports = commitlint
