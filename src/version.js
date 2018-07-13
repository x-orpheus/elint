'use strict'

const _ = require('lodash')
const { version: elintVersion } = require('../package.json')
const { version: eslintVersion } = require('eslint/package.json')
const { version: stylelintVersion } = require('stylelint/package.json')
const { version: commitlintVersion } = require('@commitlint/core/package.json')
const { version: huskyVersion } = require('husky/package.json')
const tryRequire = require('./utils/try-require')
const padEnd = require('./utils/pad-end')

/**
 * 输出 version
 *
 * @returns {void}
 */
function version () {
  const main = {
    elint: elintVersion
  }

  const dep = {
    eslint: eslintVersion,
    stylelint: stylelintVersion,
    commitlint: commitlintVersion,
    husky: huskyVersion
  }

  const preset = tryRequire(/elint-preset/)[0]
  if (preset) {
    // eslint-disable-next-line global-require
    const { version: presetVersion } = require(`${preset}/package.json`)
    main[preset] = presetVersion
  }

  const output = ['> elint version', '']

  const mainNameLength = Math.max(...Object.keys(main).map(k => k.length))

  // 兼容 node v6
  _.toPairs(main).forEach(([name, version]) => {
    output.push(`  ${padEnd(name, mainNameLength)} : ${version}`)
  })

  output.push('')
  output.push('  Dependencies:')

  const depNameLength = Math.max(...Object.keys(dep).map(k => k.length))

  // 兼容 node v6
  _.toPairs(dep).forEach(([name, version]) => {
    output.push(`    ${padEnd(name, depNameLength)} : ${version}`)
  })

  output.push('')

  console.log(output.join('\n'))
}

module.exports = version
