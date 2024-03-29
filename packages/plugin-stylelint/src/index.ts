import type stylelintNamespace from 'stylelint'
import type { LinterResult } from 'stylelint'
import type { ElintPlugin, ElintPluginResult } from 'elint'

let stylelint: typeof stylelintNamespace

const elintPluginStylelint: ElintPlugin<LinterResult> = {
  name: '@elint/plugin-stylelint',
  title: 'Stylelint',
  type: 'linter',
  activateConfig: {
    extensions: ['.less', '.sass', '.scss', '.css']
  },
  async load(ctx, importFromPreset) {
    const stylelintModule = await importFromPreset('stylelint')

    stylelint = stylelintModule.default || stylelintModule
  },
  async execute(text, { fix, cwd, filePath }) {
    const { lint, formatters } = stylelint

    const result: ElintPluginResult<LinterResult> = {
      source: text,
      output: text,
      errorCount: 0,
      warningCount: 0
    }

    const linterResult = await lint({
      code: text,
      codeFilename: filePath,
      fix,
      cwd
    })

    linterResult.results.forEach((lintResult) => {
      lintResult.warnings.forEach((warning) => {
        if (warning.severity === 'error') {
          result.errorCount += 1
        } else {
          result.warningCount += 1
        }
      })
    })

    result.result = linterResult

    // stylelint 当 fix 不为 true 时，output 会返回一个 json
    if (fix && linterResult.output) {
      if (linterResult.output === '[]' && linterResult.results.length === 0) {
        // 当文件被 stylelint ignore 命中时，返回值会成为 '[]'
        // 因此这种状态下 output 需要被忽略
      } else {
        result.output = linterResult.output
      }
    }

    const stringFormatter = formatters.string
    result.message = stringFormatter(linterResult.results, linterResult)

    return result
  }
}

export default elintPluginStylelint
