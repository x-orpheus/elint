import _debug from 'debug'
import commitlint from '@commitlint/core'
import type { LintOptions, LintOutcome } from '@commitlint/types/lib/lint'
import type { ParserOptions } from '@commitlint/types/lib/parse'
import path from 'node:path'
import fs from 'fs-extra'
import { getBaseDir } from '../../env'
import { ElintWorkerLinter, ElintWorkerResult } from '../types'

const { format, load, lint, read } = commitlint

const debug = _debug('elint:workers:commitlint')

export const elintWorkerCommitLint: ElintWorkerLinter<LintOutcome> = {
  id: 'elint-worker-eslint',
  name: 'commitlint',
  type: 'linter',
  cacheable: false,
  activateConfig: {
    type: 'after-all',
    activate({ isGit }) {
      return !!isGit
    }
  },
  async execute() {
    const baseDir = getBaseDir()

    const result: ElintWorkerResult<LintOutcome> = {
      workerId: this.id,
      input: '',
      output: '',
      success: true
    }

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
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error')

      result.error = error
      result.success = false
      result.message = `commitlint error: ${error.message}\n`
    }

    return result
  }
}