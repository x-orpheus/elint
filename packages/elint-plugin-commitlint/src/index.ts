import { createRequire } from 'module'
import commitlint from '@commitlint/core'
import type { LintOptions, LintOutcome } from '@commitlint/types/lib/lint'
import type { ParserOptions } from '@commitlint/types/lib/parse'
import path from 'path'
import fs from 'fs'
import type { ElintPlugin, ElintPluginResult } from 'elint'

const { format, load, lint, read } = commitlint
const require = createRequire(import.meta.url)

const elintPluginCommitLint: ElintPlugin<LintOutcome> = {
  id: 'elint-plugin-commitlint',
  name: 'commitlint',
  type: 'common',
  activateConfig: {
    activate() {
      return true
    }
  },
  async execute(_, { cwd }) {
    const result: ElintPluginResult<LintOutcome> = {
      pluginId: this.id,
      source: '',
      output: '',
      success: true
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

    result.success = report.errors.length === 0
    result.result = report
    result.message = formatted

    return result
  },
  getVersion() {
    const { version } = require('../package.json')
    const commitlintPackageJson = require('@commitlint/core/package.json')

    return {
      version,
      dependencies: {
        commitlint: commitlintPackageJson.version
      }
    }
  }
}

export default elintPluginCommitLint
