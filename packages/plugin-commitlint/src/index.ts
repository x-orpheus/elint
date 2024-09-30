import type { format, load, lint, read } from '@commitlint/core'
import type { LintOptions, LintOutcome } from '@commitlint/types'
import path from 'node:path'
import fs from 'node:fs'
import {
  ElintPluginType,
  type ElintPlugin,
  type ElintPluginResult
} from 'elint'

type CommitlintNamespace = {
  format: typeof format
  load: typeof load
  lint: typeof lint
  read: typeof read
}

let commitlint: CommitlintNamespace

const elintPluginCommitLint: ElintPlugin<LintOutcome> = {
  name: '@elint/plugin-commitlint',
  title: 'commitlint',
  type: ElintPluginType.Common,
  configFiles: [
    '.commitlintrc',
    '.commitlintrc.js',
    '.commitlintrc.cjs',
    '.commitlintrc.mjs',
    '.commitlintrc.yaml',
    '.commitlintrc.yml',
    '.commitlintrc.json',
    '.commitlintrc.ts',
    '.commitlintrc.cts',
    'commitlintrc.config.js',
    'commitlintrc.config.cjs',
    'commitlint.config.mjs',
    'commitlint.config.ts',
    'commitlint.config.cts'
  ],
  activateConfig: {
    activate() {
      return true
    }
  },
  async load(ctx, importFromPreset) {
    const commitlintModule =
      await importFromPreset<CommitlintNamespace>('@commitlint/core')

    commitlint = commitlintModule
  },
  async execute(_, { cwd }) {
    const { format, load, lint, read } = commitlint

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
      parserOpts: config.parserPreset?.parserOpts as LintOptions['parserOpts']
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
