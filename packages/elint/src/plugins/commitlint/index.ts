import _debug from 'debug'
import commitlint from '@commitlint/core'
import type { LintOptions, LintOutcome } from '@commitlint/types/lib/lint'
import type { ParserOptions } from '@commitlint/types/lib/parse'
import path from 'path'
import fs from 'fs-extra'
import { getBaseDir } from '../../env'
import { ElintPlugin, ElintPluginResult } from '../../plugin/types'

const { format, load, lint, read } = commitlint

const debug = _debug('elint:plugin:commitlint')

export const elintPluginCommitLint: ElintPlugin<LintOutcome> = {
  id: 'elint-plugin-commitlint',
  name: 'commitlint',
  type: 'linter',
  cacheable: false,
  activateConfig: {
    activate() {
      return true
    }
  },
  async execute() {
    const baseDir = getBaseDir()

    const result: ElintPluginResult<LintOutcome> = {
      pluginId: this.id,
      input: '',
      output: '',
      success: true
    }

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

    result.input = message[0] || ''
    result.output = message[0] || ''

    const rules = config.rules
    const options: LintOptions = {
      parserOpts: config.parserPreset?.parserOpts as ParserOptions
    }
    const report = await lint(message[0], rules, options)
    const formatted = format({
      results: [report]
    })

    result.success = report.errors.length === 0
    result.result = report
    result.message = formatted

    return result
  }
}
