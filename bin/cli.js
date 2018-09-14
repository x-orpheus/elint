#!/usr/bin/env node

'use strict'

/**
 * cli
 */

const debug = require('debug')('elint:cli')
const program = require('commander')
const { description } = require('../package.json')
const { elint, installFromCli, diff, commitlint, runHooks, version } = require('../src')
const log = require('../src/utils/log')

debug('process.argv: %o', process.argv)

program
  .usage('[command] [options]')
  .description(description)

/**
 * 输出 version
 */
program
  .option('-v, --version', 'output the version number', () => {
    version()
    process.exit()
  })

/**
 * 执行 lint
 * 不指定 type，执行除了 commitlint 之外的全部
 */
program
  .command('lint [type] [files...]')
  .alias('l')
  .description('run lint, type: es, style, commit')
  .option('-f, --fix', 'Automatically fix problems')
  .option('-ff, --force-fix', 'Automatically fix problems, even in git hooks')
  .option('--no-ignore', 'Disable elint ignore patterns')
  .action((type, files, options) => {
    debug('run lint...')

    if (!type || !files) {
      return
    }

    if (type === 'commit') {
      commitlint()
      return
    }

    let parsedFiles, parsedType

    if (['es', 'style'].includes(type)) {
      parsedFiles = files
      parsedType = type
    } else {
      parsedFiles = [type, ...files]
    }

    /**
     * 坑：commander options 存在循环引用
     * 手动合并
     */
    const elintOptions = {
      type: parsedType,
      fix: options.fix,
      forceFix: options.forceFix,
      noIgnore: options.noIgnore
    }

    elint(parsedFiles, elintOptions)
  })

/**
 * 安装 preset
 */
program
  .command('install [presetName]')
  .alias('i')
  .option('-r, --registry <url>', 'Specify npm registry')
  .option('-k, --keep', 'If there is an old configuration file, keep it from being override')
  .description('install or update preset')
  .action((preset, options) => {
    debug('run install...')
    installFromCli(preset, {
      registry: options.registry,
      keep: options.keep
    })
  })

/**
 * 对比 preset config
 */
program
  .command('diff')
  .alias('d')
  .description('diff preset')
  .action(() => {
    debug('run diff...')
    diff()
  })

/**
 * install & uninstall hooks
 */
program
  .command('hooks [action]')
  .alias('h')
  .description('install & uninstall hooks')
  .action(action => {
    debug(`run ${action} hooks...`)
    runHooks(action)
  })

/**
 * 未知 command
 */
program.on('command:*', function () {
  const command = program.args.join(' ')
  const message = [
    `Invalid command: ${command}`,
    'See --help for a list of available commands.'
  ]

  log.error(...message)
  process.exit(1)
})

/**
 * 输出 help
 */
program.on('--help', function () {
  console.log('')
  console.log('  Examples:')
  console.log('')
  console.log('    output help information')
  console.log('    $ elint install --help')
  console.log('')
  console.log('    lint all js and css')
  console.log('    $ elint lint "**/*.js" "**/*.css"')
  console.log('')
  console.log('    run eslint')
  console.log('    $ elint lint es "**/*.js"')
  console.log('')
  console.log('    run commitlint')
  console.log('    $ elint lint commit')
  console.log('')
  console.log('    install git hooks')
  console.log('    $ elint hooks install')
  console.log('')
  console.log('    install elint-preset-test')
  console.log('    $ elint install test --registry=<npm registry>')
  console.log('')
})

program.parse(process.argv)

function showHelp () {
  // 没有输入任何参数
  if (process.argv.length === 2) {
    return true
  }

  let argus = process.argv.slice(2)

  return argus.every(item => item.startsWith('-'))
}

if (showHelp()) {
  program.help()
}
