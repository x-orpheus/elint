import { createRequire } from 'module'
import { ESLint } from 'eslint'
import type { ElintPlugin, ElintPluginOptions, ElintPluginResult } from 'elint'

const require = createRequire(import.meta.url)

const esLintInstanceMap = new Map<string, ESLint>()
const esLintFormatterMap = new Map<ESLint, ESLint.Formatter>()

const getEsLintByOptions = async ({
  fix,
  cwd
}: ElintPluginOptions): Promise<{
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

const elintPluginEsLint: ElintPlugin<ESLint.LintResult> = {
  id: 'elint-plugin-eslint',
  name: 'ESLint',
  type: 'linter',
  activateConfig: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.mjs']
  },
  async execute(text, options) {
    const { filePath } = options

    const { esLint, formatter } = await getEsLintByOptions(options)

    const result: ElintPluginResult<ESLint.LintResult> = {
      source: text,
      output: text,
      errorCount: 0,
      warningCount: 0
    }

    const lintResults = await esLint.lintText(text, {
      filePath
    })

    const lintResult = lintResults[0]
    result.errorCount = lintResult?.errorCount || 0
    result.warningCount = lintResult?.warningCount || 0
    result.output = lintResult?.output ?? result.output
    result.result = lintResult

    if (lintResult) {
      result.message = await formatter.format([lintResult])

      // eslint 的 stylish formatter 会在底部添加总结，这里把总结去掉
      if (result.message) {
        const removeLineCount =
          (lintResult.errorCount + lintResult.warningCount > 0 ? 2 : 0) +
          (lintResult.fixableErrorCount + lintResult.fixableWarningCount > 0
            ? 2
            : 0)
        if (removeLineCount) {
          result.message =
            result.message.split('\n').slice(0, -removeLineCount).join('\n') +
            '\n'
        }
      }
    }

    return result
  },
  getVersion() {
    const { version } = require('../package.json')
    const eslintPackageJson = require('eslint/package.json')

    return {
      version,
      dependencies: {
        eslint: eslintPackageJson.version
      }
    }
  }
}

export default elintPluginEsLint
