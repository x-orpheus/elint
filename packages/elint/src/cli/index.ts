#!/usr/bin/env node

import _debug from 'debug'
import { createRequire } from 'module'
import chalk from 'chalk'
import { program } from 'commander'
import { install as huskyInstall, uninstall as huskyUninstall } from 'husky'
import version from './version.js'
import log from '../utils/log.js'
import isGitHooks from '../utils/is-git-hooks.js'
import {
  ElintOptions,
  lintFiles,
  lintCommon,
  loadPresetAndPlugins,
  ElintResult
} from '../elint.js'
import { report } from '../utils/report.js'
import notify from '../notifier/index.js'
import { getBaseDir } from '../env.js'

const { description } = createRequire(import.meta.url)('../../package.json')
const debug = _debug('elint:cli')

debug('process.argv: %o', process.argv)

program
  .usage('[command] [options]')
  .description(description)
  .storeOptionsAsProperties(true)

/**
 * 输出 version
 */
program
  .option('-v, --version', 'output the version number')
  .action(async () => {
    const cwd = getBaseDir()

    const loadedPrestAndPlugins = await loadPresetAndPlugins({ cwd })

    await version(loadedPrestAndPlugins)
    await notify(loadedPrestAndPlugins, cwd)

    process.exit(0)
  })

/**
 * 执行 lint
 * 不指定 type，执行除了 commitlint 之外的全部
 */
program
  .command('lint [type] [files...]')
  .alias('l')
  .description('run lint, type: file, commit, common')
  .option('-f, --fix', 'Automatically fix problems')
  .option('-s, --style', 'Lint code style')
  .option('--no-ignore', 'Disable elint ignore patterns')
  .action(async (type, files, options) => {
    debug('run lint...')

    if (!files || !type) {
      return
    }

    const cwd = getBaseDir()

    const loadedPrestAndPlugins = await loadPresetAndPlugins({ cwd })

    const isGit = await isGitHooks()

    debug(`is in git: ${isGit}`)

    const elintOptions: ElintOptions = {
      fix: options.fix,
      style: options.style,
      noIgnore: options.noIgnore,
      git: isGit,
      loadedPrestAndPlugins,
      cwd
    }

    try {
      const results: ElintResult[] = []

      if (type === 'commit' || type === 'common') {
        if (type === 'commit') {
          const isContainCommitlint = loadedPrestAndPlugins.loadedPlugins.some(
            (plugin) => plugin.id === 'elint-plugin-commitlint'
          )

          if (!isContainCommitlint) {
            log.warn(
              `\n[elint] Current preset does not contain ${chalk.underline(
                'elint-plugin-commitlint'
              )}\n`
            )
          }
        }
        results.push(await lintCommon(elintOptions))
      } else {
        const fileList = type === 'file' ? files : [type, ...files]

        results.push(...(await lintFiles(fileList, elintOptions)))
      }

      console.log(report(results))

      if (!isGit) {
        await notify(loadedPrestAndPlugins, cwd)
      }

      const success = !results.some((result) => !result.success)

      process.exit(success ? 0 : 1)
    } catch (e) {
      log.error('[elint]', (e as Error).message)
      process.exit(1)
    }
  })

/**
 * install & uninstall hooks
 */
program
  .command('hooks [action]')
  .alias('h')
  .description('install & uninstall hooks')
  .action((action) => {
    debug(`run ${action} hooks...`)
    if (['install', 'uninstall'].indexOf(action) === -1) {
      log.error(`不支持的 action: ${action}`)
      process.exit(1)
    }

    try {
      if (action === 'install') {
        huskyInstall()
      } else {
        huskyUninstall()
      }
    } catch (e) {
      log.error(`[elint] husky hooks ${action} error`)
      console.log(e)
    }
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
  console.log('    lint all js and css')
  console.log('    $ elint lint "**/*.js" "**/*.css"')
  console.log('')
  console.log('    install git hooks')
  console.log('    $ elint hooks install')
  console.log('')
})

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(0)
}

program.parse(process.argv)
