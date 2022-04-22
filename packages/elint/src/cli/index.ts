#!/usr/bin/env node

import _debug from 'debug'
import { createRequire } from 'module'
import chalk from 'chalk'
import { program } from 'commander'
import { install as huskyInstall, uninstall as huskyUninstall } from 'husky'
import version from './version.js'
import log from '../utils/log.js'
import isGitHooks from '../utils/is-git-hooks.js'
import { lintFiles, lintCommon, loadPresetAndPlugins, reset } from '../elint.js'
import type { ElintOptions, ElintResult } from '../types.js'
import report from '../utils/report.js'
import notify from '../notifier/index.js'
import { getBaseDir } from '../env.js'

const { description } = createRequire(import.meta.url)('../../package.json')
const debug = _debug('elint:cli')

debug('process.argv: %o', process.argv)

program.name('elint').usage('[command] [options]').description(description)

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
  .option('--cache', 'Cache results')
  .option('--cache-location <cacheLocation>', 'Cache file location')
  .option('--preset <preset>', 'Set specific preset')
  .option('--no-ignore', 'Disable elint ignore patterns')
  .option('--no-notifier', 'Disable check preset updates')
  .option('--force-notifier', 'Force check preset updates')
  .action(async (type: string, files: string[], options) => {
    if (!files || !type) {
      return
    }

    const startTime = Date.now()

    const cwd = getBaseDir()

    debug(`run lint in ${cwd}`)

    const internalLoadedPrestAndPlugins = await loadPresetAndPlugins({
      cwd,
      preset: options.preset
    })

    const isGit = await isGitHooks()

    debug(`is in git: ${isGit}`)

    const elintOptions: ElintOptions = {
      fix: options.fix,
      style: options.style,
      noIgnore: !options.ignore,
      git: isGit,
      internalLoadedPrestAndPlugins,
      cwd,
      cache: options.cache,
      cacheLocation: options.cacheLocation
    }

    try {
      const results: ElintResult[] = []

      if (type === 'commit' || type === 'common') {
        debug('run common lint...')
        if (type === 'commit') {
          const isContainCommitlint =
            internalLoadedPrestAndPlugins.internalPlugins.some(
              (plugin) => plugin.name === 'elint-plugin-commitlint'
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
        debug('run file lint...')

        const fileList = type === 'file' ? files : [type, ...files]

        results.push(...(await lintFiles(fileList, elintOptions)))
      }

      console.log(report(results))

      debug(`lint complete in: ${Date.now() - startTime}ms`)

      if (!isGit && options.notifier) {
        debug('start notifier')

        const notifyMessage = await notify(
          internalLoadedPrestAndPlugins,
          cwd,
          options.forceNotifier
        )
        if (notifyMessage) {
          console.log(notifyMessage)
        }
      } else {
        debug('disable notifier')
      }

      const success = !results.some((result) => result.errorCount > 0)

      debug(`elint finished in: ${Date.now() - startTime}ms`)

      process.exit(success ? 0 : 1)
    } catch (e) {
      console.log(e)

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
  .action((action: string) => {
    debug(`run ${action} hooks...`)
    if (['install', 'uninstall'].indexOf(action) === -1) {
      log.error(`[elint] hooks 不支持的 action: ${action}`)
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

program
  .command('reset')
  .description('reset plugin cache & elint cache')
  .action(async () => {
    const errorMap = await reset()

    if (Object.keys(errorMap).length === 0) {
      log.success('elint reset successfully')
      process.exit(0)
    }

    Object.entries(errorMap).forEach(([pluginId, error]) => {
      log.error(`${pluginId} error: `, error)
    })

    process.exit(1)
  })

/**
 * 未知 command
 */
program
  .command('invalid', { isDefault: true, hidden: true })
  .option('-v, --version', 'output the version number')
  .action(async (options) => {
    if (options.version) {
      await version()

      process.exit(0)
    }
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
program.on('--help', () => {
  console.log('')
  console.log('  Examples:')
  console.log('')
  console.log('    lint files')
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
