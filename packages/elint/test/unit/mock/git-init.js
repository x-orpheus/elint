'use strict'

const { execa } = require('execa')
const { getBaseDir } = require('../../../src/env')

async function gitInit() {
  const options = {
    cwd: getBaseDir()
  }

  await execa('git', ['init'], options)
  await execa('git', ['config', 'core.autocrlf', 'false'], options)
  await execa('git', ['add', '.'], options)
}

module.exports = gitInit
