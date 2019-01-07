'use strict'

const chalk = require('chalk')
const boxen = require('boxen')

function report (info) {
  const { name, current, latest } = info

  const messages = [
    `update available ${chalk.dim(current)} → ${chalk.green(latest)}`,
    `Run ${chalk.cyan('npm i ' + name + ' -D')} to update`
  ]

  const boxenOptions = {
    padding: 1,
    margin: 1,
    align: 'center',
    borderColor: 'yellow',
    borderStyle: 'round'
  }

  return boxen(messages.join('\n'), boxenOptions)
}

module.exports = report
