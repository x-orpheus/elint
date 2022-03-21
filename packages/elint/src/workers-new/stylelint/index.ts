import { lint, LinterResult, formatters } from 'stylelint'
import { ElintWorkerLinter, ElintWorkerResult } from '../worker'

export const elintWorkerStylelint: ElintWorkerLinter<LinterResult> = {
  id: 'elint-worker-stylelint',
  name: 'Stylelint',
  type: 'linter',
  fixable: true,
  cacheable: true,
  availableExtnameList: ['.less', '.sass', '.scss', '.css'],
  async executeOnText(text, { fix, cwd, filePath }) {
    const result: ElintWorkerResult<LinterResult> = {
      workerId: this.id,
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
      const error = e instanceof Error ? e : new Error('Unknown error')

      result.error = error
      result.success = false
    }

    if (result.result) {
      const stringFormatter = formatters.string

      result.message = stringFormatter(result.result.results)
    } else if (result.error) {
      result.message = `${filePath || 'Untitled file'}: ${
        result.error.message
      }\n`
    }

    return result
  }
}
