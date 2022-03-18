import { lint, LinterResult, formatters } from 'stylelint'
import { ElintWorkerLinter, ElintWorkerResult } from '../worker'

export const elintWorkerStylelint: ElintWorkerLinter<LinterResult> = {
  name: 'elint-worker-stylelint',
  type: 'linter',
  fixable: true,
  cacheable: true,
  availableExtnameList: ['.less', '.sass', '.scss', '.css'],
  async executeOnText(text, { fix, cwd, filePath }) {
    const result: ElintWorkerResult<LinterResult> = {
      worker: {
        name: this.name,
        type: this.type
      },
      input: text,
      output: text,
      success: true
    }

    try {
      const lintResult = await lint({
        code: text,
        codeFilename: filePath,
        fix,
        cwd
      })

      result.success = !lintResult.errored
      result.result = lintResult
      result.output = lintResult.output ?? result.output
    } catch (e) {
      const error = e instanceof Error ? e : new Error('unknown error')

      result.error = error
      result.success = false
    }

    if (result.result) {
      const stringFormatter = formatters.string

      result.message = stringFormatter(result.result.results)
    } else if (result.error) {
      result.message = `${filePath || 'unknown file'}: ${result.error.message}\n`
    }

    return result
  }
}
