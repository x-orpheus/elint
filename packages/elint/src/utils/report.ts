import chalk from 'chalk'
import figures from 'figures'
import type { ElintResult } from '../types.js'

/**
 * 按行（每行）缩进指定宽度
 *
 * @param string 要操作的字符串
 * @param span 缩进
 * @returns 处理后的文本
 */
function padding(string: string, span = 2): string {
  const spaces = ' '.repeat(span)
  return spaces + string.replace(/\n/g, `\n${spaces}`)
}

/**
 * 移除多余的空行
 * 连续两个以上的 \n 合并为两个
 *
 * @param string 要操作的字符串
 * @returns 处理后的文本
 */
function reduceEmptyLine(string: string): string {
  return string.replace(/\n([ ]*\n)+/g, '\n\n')
}

export interface ReportResult {
  /**
   * 段落名
   */
  name: string
  /**
   * 段落内容
   */
  output: string
  /**
   * 是否成功
   */
  success: boolean
}

const passedMessage = chalk.green(`${figures.tick} Passed`)

/**
 * report
 *
 * @param results 要输出到命令行的内容
 * @returns output
 */
export function formatReportResults(results: ReportResult[]): string {
  const arr = []

  // 将 name 相同的 result 合并成一个
  const mergedResults = results.reduce<ReportResult[]>((pv, cv) => {
    const itemIndex = pv.findIndex((item) => item.name === cv.name)
    if (itemIndex !== -1) {
      pv[itemIndex].success = pv[itemIndex].success && cv.success
      pv[itemIndex].output += cv.output
      return pv
    }
    return pv.concat(cv)
  }, [])

  mergedResults.forEach((result) => {
    const name = result.name
    const output = result.output
    const success = result.success

    arr.push('\n')
    arr.push(`${chalk.bold(`> ${name}:`)}\n`)
    arr.push('\n')

    if (success && !output.trim()) {
      arr.push(padding(passedMessage))
    } else {
      arr.push(padding(output))
    }

    arr.push('\n')
  })

  arr.push('\n')

  return reduceEmptyLine(arr.join(''))
}

export function createErrorReportResult(
  name: string,
  filePath?: string,
  error?: unknown,
  customMessage?: string
): ReportResult {
  return {
    name,
    success: false,
    output: `${filePath ? `${chalk.underline(filePath)}\n  ` : ''}${
      customMessage ??
      `${chalk.red('error:')} ${
        error instanceof Error ? error.message : 'unknown error'
      }`
    }\n\n`
  }
}

export function report(results: ElintResult[]): string {
  const reportResults: ReportResult[] = []

  results.forEach((result) => {
    reportResults.push(...result.reportResults)
  })

  if (!reportResults.length) {
    reportResults.push({
      name: 'elint',
      success: true,
      output: ''
    })
  }

  return formatReportResults(reportResults)
}
