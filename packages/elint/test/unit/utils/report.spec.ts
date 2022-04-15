import chalk from 'chalk'
import figures from 'figures'
import type { ElintResult } from '../../../src/types.js'
import report from '../../../src/utils/report.js'

describe('report 测试', () => {
  test('结果合并', () => {
    const input: ElintResult[] = [
      {
        source: '',
        output: '',
        errorCount: 0,
        warningCount: 0,
        pluginResults: [
          {
            pluginId: 'test',
            pluginName: 'name',
            errorCount: 0,
            source: '',
            output: '',
            warningCount: 0,
            message: 'output1\n'
          },
          {
            pluginId: 'test',
            pluginName: 'name2',
            errorCount: 0,
            source: '',
            output: '',
            warningCount: 0,
            message: 'output2\n'
          }
        ]
      },
      {
        source: '',
        output: '',
        errorCount: 0,
        warningCount: 0,
        pluginResults: [
          {
            pluginId: 'test',
            pluginName: 'name',
            errorCount: 0,
            source: '',
            output: '',
            warningCount: 0,
            message: 'output3\n'
          }
        ]
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
        errorCount: 0,
        warningCount: 0,
        pluginResults: []
      },
      {
        source: '',
        output: '',
        errorCount: 0,
        warningCount: 0,
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
