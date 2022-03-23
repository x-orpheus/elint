import stylelint, { type LinterResult } from 'stylelint'
import { ElintPlugin, ElintPluginResult } from '../types'

const { lint, formatters } = stylelint

export const elintPluginStylelint: ElintPlugin<LinterResult> = {
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
    result.output = lintResult.output ?? result.output

    const stringFormatter = formatters.string
    result.message = stringFormatter(lintResult.results)

    return result
  }
}
