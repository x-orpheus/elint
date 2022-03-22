import stylelint, { type LinterResult } from 'stylelint'
import { ElintWorkerLinter, ElintWorkerResult } from '../types'

const { lint, formatters } = stylelint

export const elintWorkerStylelint: ElintWorkerLinter<LinterResult> = {
  id: 'elint-worker-stylelint',
  name: 'Stylelint',
  type: 'linter',
  cacheable: true,
  activateConfig: {
    extensions: ['.less', '.sass', '.scss', '.css'],
    type: 'file'
  },
  async execute(text, { fix, cwd, filePath }) {
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

      const stringFormatter = formatters.string
      result.message = stringFormatter(lintResult.results)
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Unknown error')

      result.error = error
      result.success = false
      result.message = `${filePath || 'Untitled file'}: ${error.message}\n`
    }

    return result
  }
}
