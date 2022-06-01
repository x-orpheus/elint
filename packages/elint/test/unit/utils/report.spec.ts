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
            errorCount: 0,
            source: '',
            output: '',
            warningCount: 0,
            message: 'output1\n',
            pluginData: {
              name: 'test',
              title: 'name',
              type: 'linter'
            }
          },
          {
            errorCount: 0,
            source: '',
            output: '',
            warningCount: 0,
            message: 'output2\n',
            pluginData: {
              name: 'test',
              title: 'name2',
              type: 'linter'
            }
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
            errorCount: 0,
            source: '',
            output: '',
            warningCount: 0,
            message: 'output3\n',
            pluginData: {
              name: 'test',
              title: 'name',
              type: 'linter'
            }
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
    result.push(`${chalk.bold('> elint:')}\n`)
    result.push('\n')
    result.push('  ' + chalk.green(`${figures.tick} Passed`))
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

  test('警告输出', () => {
    const input: ElintResult[] = [
      {
        source: '',
        output: '',
        errorCount: 0,
        warningCount: 2,
        pluginResults: [
          {
            errorCount: 0,
            source: '',
            output: '',
            warningCount: 2,
            message: 'output\n',
            pluginData: {
              name: 'test',
              title: 'name',
              type: 'linter'
            }
          }
        ]
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> name:')}\n`)
    result.push('\n')
    result.push('  output\n')
    result.push('\n')
    result.push(`${chalk.bold('> elint:')}\n`)
    result.push('\n')
    result.push(
      '  ' + chalk.yellow(`${figures.cross} 2 problems (0 error, 2 warnings)`)
    )
    result.push('\n')
    result.push('\n')

    expect(report(input)).toEqual(result.join(''))
  })

  test('失败输出', () => {
    const input: ElintResult[] = [
      {
        source: '',
        output: '',
        errorCount: 1,
        warningCount: 2,
        pluginResults: [
          {
            errorCount: 1,
            source: '',
            output: '',
            warningCount: 2,
            message: 'output\n',
            pluginData: {
              name: 'test',
              title: 'name',
              type: 'linter'
            }
          }
        ]
      }
    ]

    const result = []

    result.push('\n')
    result.push(`${chalk.bold('> name:')}\n`)
    result.push('\n')
    result.push('  output\n')
    result.push('\n')
    result.push(`${chalk.bold('> elint:')}\n`)
    result.push('\n')
    result.push(
      '  ' + chalk.red(`${figures.cross} 3 problems (1 error, 2 warnings)`)
    )
    result.push('\n')
    result.push('\n')

    expect(report(input)).toEqual(result.join(''))
  })
})
