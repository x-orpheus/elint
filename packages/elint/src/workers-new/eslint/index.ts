import { ESLint } from 'eslint'
import {
  ElintWorkerLinter,
  ElintWorkerLinterOption,
  ElintWorkerResult
} from '../worker'

const esLintInstanceMap = new Map<string, ESLint>()
const esLintFormatterMap = new Map<ESLint, ESLint.Formatter>()

const getEsLintByOption = async ({
  fix,
  cwd
}: ElintWorkerLinterOption): Promise<{
  esLint: ESLint
  formatter: ESLint.Formatter
}> => {
  let key = fix ? '1' : '0'
  if (cwd) {
    key += `-${cwd}`
  }

  let esLint = esLintInstanceMap.get(key)

  if (!esLint) {
    esLint = new ESLint({ fix, cwd })
    esLintInstanceMap.set(key, esLint)
  }

  let formatter = esLintFormatterMap.get(esLint)

  if (!formatter) {
    formatter = await esLint.loadFormatter('stylish')
    esLintFormatterMap.set(esLint, formatter)
  }

  return {
    esLint,
    formatter
  }
}

export const elintWorkerEsLint: ElintWorkerLinter<ESLint.LintResult> = {
  name: 'elint-worker-eslint',
  type: 'linter',
  fixable: true,
  cacheable: true,
  availableExtnameList: ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
  async executeOnText(text, { fix, cwd, filePath }) {
    const { esLint, formatter } = await getEsLintByOption({ fix, cwd })

    const result: ElintWorkerResult<ESLint.LintResult> = {
      worker: {
        name: this.name,
        type: this.type
      },
      input: text,
      output: text,
      success: true
    }

    try {
      const lintResults = await esLint.lintText(text, {
        filePath
      })

      const errorResults = ESLint.getErrorResults(lintResults)

      result.success = errorResults.length > 0
      result.output = lintResults[0]?.output ?? result.output
      result.result = lintResults[0]
    } catch (e) {
      const error = e instanceof Error ? e : new Error('unknown error')

      result.error = error
      result.success = false
    }

    if (result.result) {
      result.message = await formatter.format([result.result])

      if (result.message) {
        result.message = result.message.split('\n').slice(0, -3).join('\n')
      }
    } else if (result.error) {
      result.message = `${filePath || 'unknown file'}: ${
        result.error.message
      }\n`
    }

    return result
  }
}
