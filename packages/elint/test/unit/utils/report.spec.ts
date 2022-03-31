import chalk from 'chalk'
import figures from 'figures'
import type { ElintResult } from '../../../src/elint.js'
import {
  createErrorReportResult,
  formatReportResults,
  report
} from '../../../src/utils/report.js'

describe('formatReportResults 测试', () => {
  test('单条成功', () => {
    const input = [
      {
        name: 'name',
        output: 'output',
        success: true
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> name:')}\n`)
    result.push('\n')
    result.push('  output')
    result.push('\n')

    result.push('\n')

    expect(formatReportResults(input)).toEqual(result.join(''))
  })

  test('单条成功, output 为空', () => {
    const input = [
      {
        name: 'name',
        output: '',
        success: true
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> name:')}\n`)
    result.push('\n')
    result.push('  ' + chalk.green(`${figures.tick} Passed`))
    result.push('\n')

    result.push('\n')

    expect(formatReportResults(input)).toEqual(result.join(''))
  })

  test('单条成功, 输出包含换行', () => {
    const input = [
      {
        name: 'name',
        output: 'output\noutput',
        success: true
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> name:')}\n`)
    result.push('\n')
    result.push('  output\n  output')
    result.push('\n')

    result.push('\n')

    expect(formatReportResults(input)).toEqual(result.join(''))
  })

  test('多条成功', () => {
    const input = [
      {
        name: 'name1',
        output: 'output1',
        success: true
      },
      {
        name: 'name2',
        output: 'output2',
        success: true
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> name1:')}\n`)
    result.push('\n')
    result.push('  output1')
    result.push('\n')

    result.push('\n')
    result.push(`${chalk.bold('> name2:')}\n`)
    result.push('\n')
    result.push('  output2')
    result.push('\n')

    result.push('\n')

    expect(formatReportResults(input)).toEqual(result.join(''))
  })

  test('单条失败', () => {
    const input = [
      {
        name: 'name',
        output: 'output',
        success: false
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> name:')}\n`)
    result.push('\n')
    result.push('  output')
    result.push('\n')

    result.push('\n')

    expect(formatReportResults(input)).toEqual(result.join(''))
  })

  test('合并相同 name 的配置', () => {
    const input = [
      {
        name: 'name',
        output: 'output1',
        success: true
      },
      {
        name: 'name2',
        output: 'output2',
        success: true
      },
      {
        name: 'name',
        output: ' output2',
        success: true
      },
      {
        name: 'name',
        output: ' output3',
        success: false
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> name:')}\n`)
    result.push('\n')
    result.push('  output1 output2 output3')
    result.push('\n')

    result.push('\n')
    result.push(`${chalk.bold('> name2:')}\n`)
    result.push('\n')
    result.push('  output2')
    result.push('\n')

    result.push('\n')

    expect(formatReportResults(input)).toEqual(result.join(''))
  })
})

describe('createErrorReportResult 测试', () => {
  test('只有名称', () => {
    const error = createErrorReportResult('name')

    const result = []

    result.push(`${chalk.red('error:')} `)
    result.push('unknown error')
    result.push('\n')
    result.push('\n')

    expect(error.name).toEqual('name')
    expect(error.success).toEqual(false)
    expect(error.output).toEqual(result.join(''))
  })

  test('只有名称和文件路径', () => {
    const filePath = 'src/a.js'
    const error = createErrorReportResult('name', filePath)

    const result = []

    result.push(chalk.underline(filePath))
    result.push('\n  ')
    result.push(`${chalk.red('error:')} `)
    result.push('unknown error')
    result.push('\n')
    result.push('\n')

    expect(error.name).toEqual('name')
    expect(error.success).toEqual(false)
    expect(error.output).toEqual(result.join(''))
  })

  test('名称，文件路径和 error', () => {
    const filePath = 'src/a.js'
    const error = createErrorReportResult('name', filePath, new Error('error'))

    const result = []

    result.push(chalk.underline(filePath))
    result.push('\n  ')
    result.push(`${chalk.red('error:')} `)
    result.push('error')
    result.push('\n')
    result.push('\n')

    expect(error.name).toEqual('name')
    expect(error.success).toEqual(false)
    expect(error.output).toEqual(result.join(''))
  })

  test('名称，文件路径和自定义消息', () => {
    const filePath = 'src/a.js'
    const error = createErrorReportResult('name', filePath, undefined, 'custom')

    const result = []

    result.push(chalk.underline(filePath))
    result.push('\n  ')
    result.push('custom')
    result.push('\n')
    result.push('\n')

    expect(error.name).toEqual('name')
    expect(error.success).toEqual(false)
    expect(error.output).toEqual(result.join(''))
  })
})

describe('report 测试', () => {
  test('结果合并', () => {
    const input: ElintResult[] = [
      {
        source: '',
        output: '',
        success: true,
        reportResults: [
          {
            name: 'name',
            output: 'output1\n',
            success: true
          },
          {
            name: 'name2',
            output: 'output2\n',
            success: true
          }
        ],
        pluginResults: []
      },
      {
        source: '',
        output: '',
        success: true,
        reportResults: [
          {
            name: 'name',
            output: 'output3\n',
            success: true
          }
        ],
        pluginResults: []
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> name:')}\n`)
    result.push('\n')
    result.push('  output1')
    result.push('\n')
    result.push('  output3')
    result.push('\n')
    result.push('\n')
    result.push(`${chalk.bold('> name2:')}\n`)
    result.push('\n')
    result.push('  output2')
    result.push('\n')
    result.push('\n')

    expect(report(input)).toEqual(result.join(''))
  })

  test('成功输出', () => {
    const input: ElintResult[] = [
      {
        source: '',
        output: '',
        success: true,
        reportResults: [],
        pluginResults: []
      },
      {
        source: '',
        output: '',
        success: true,
        reportResults: [],
        pluginResults: []
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> elint:')}\n`)
    result.push('\n')
    result.push('  ' + chalk.green(`${figures.tick} Passed`))
    result.push('\n')
    result.push('\n')

    expect(report(input)).toEqual(result.join(''))
  })
})
