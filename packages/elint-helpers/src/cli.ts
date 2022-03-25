#!/usr/bin/env node

import _debug from 'debug'
import { program } from 'commander'
import { description } from '../package.json'
import { install } from '.'

const debug = _debug('elint-helpers:cli')

program
  .usage('[command] [options]')
  .description(description)
  .storeOptionsAsProperties(true)

/**
 * install preset
 */
program
  .command('install')
  .description('install preset')
  .option('--preset <presetPath>', 'Preset path')
  .option('--project <projectPath>', 'Project path')
  .action((options) => {
    debug('run install...')
    console.log(process.cwd())
    install({
      presetPath: options.preset,
      projectPath: options.project
    })
  })

if (!process.argv.slice(2).length) {
  program.outputHelp()
  process.exit(0)
}

program.parse(process.argv)
