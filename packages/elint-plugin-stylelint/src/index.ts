import { createRequire } from 'module'
import stylelint, { type LinterResult } from 'stylelint'
import type { ElintPlugin, ElintPluginResult } from 'elint'

const { lint, formatters } = stylelint
const require = createRequire(import.meta.url)

const elintPluginStylelint: ElintPlugin<LinterResult> = {
  id: 'elint-plugin-stylelint',
  name: 'Stylelint',
  type: 'linter',
  cacheable: true,
  activateConfig: {
    extensions: ['.less', '.sass', '.scss', '.css']
  },
  async execute(text, { fix, cwd, filePath }) {
    const result: ElintPluginResult<LinterResult> = {
      pluginId: this.id,
      input: text,
      output: text,
      success: true
    }

    const lintResult = await lint({
      code: text,
      codeFilename: filePath,
      fix,
      cwd
    })

    result.success = !lintResult.errored
    result.result = lintResult
    // stylelint 当 fix 不为 true 时，output 会返回一个 json
    result.output = lintResult.output && fix ? lintResult.output : result.output

    const stringFormatter = formatters.string
    result.message = stringFormatter(lintResult.results)

    return result
  },
  getVersion() {
    const { version } = require('../package.json')
    const stylelintPackageJson = require('stylelint/package.json')

    return {
      version,
      dependencies: {
        stylelint: stylelintPackageJson.version
      }
    }
  }
}

export default elintPluginStylelint
