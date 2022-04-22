import commitlint from '@commitlint/core'
import type { LintOptions, LintOutcome } from '@commitlint/types/lib/lint'
import type { ParserOptions } from '@commitlint/types/lib/parse'
import path from 'path'
import fs from 'fs'
import type { ElintPlugin, ElintPluginResult } from 'elint'

const { format, load, lint, read } = commitlint

const elintPluginCommitLint: ElintPlugin<LintOutcome> = {
  name: 'elint-plugin-commitlint',
  title: 'commitlint',
  type: 'common',
  activateConfig: {
    activate() {
      return true
    }
  },
  async execute(_, { cwd }) {
    const result: ElintPluginResult<LintOutcome> = {
      errorCount: 0,
      warningCount: 0,
      source: '',
      output: ''
    }

    const readOptions = {
      cwd,
      edit: '.git/COMMIT_EDITMSG'
    }

    const gitMsgFilePath = path.join(readOptions.cwd, readOptions.edit)

    if (!fs.existsSync(gitMsgFilePath)) {
      throw new Error('无法读取 git commit 信息')
    }

    const [message, config] = await Promise.all([read(readOptions), load()])

    result.source = message[0] || ''
    result.output = message[0] || ''

    const rules = config.rules
    const options: LintOptions = {
      parserOpts: config.parserPreset?.parserOpts as ParserOptions
    }
    const report = await lint(message[0], rules, options)
    const formatted = format({
      results: [report]
    })

    result.errorCount = report.errors.length
    result.result = report
    result.message = formatted

    return result
  }
}

export default elintPluginCommitLint
