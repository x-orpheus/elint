import chalk from 'chalk'
import figures from 'figures'
import type { ElintResult } from '../../../src/types.js'
import report from '../../../src/utils/report.js'
import { ElintPluginType } from '../../../src/index.js'

describe('report 测试', () => {
  test('结果合并', () => {
    const input: ElintResult[] = [
      {
        source: '',
        output: '',
        errorCount: 0,
        warningCount: 0,
        isBinary: false,
        filePath: '',
        fromCache: false,
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
              type: ElintPluginType.Linter
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
              type: ElintPluginType.Linter
            }
          }
        ]
      },
      {
        source: '',
        output: '',
        errorCount: 0,
        warningCount: 0,
        isBinary: false,
        filePath: '',
        fromCache: false,
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
              type: ElintPluginType.Linter
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
        isBinary: false,
        filePath: '',
        fromCache: false,
        pluginResults: []
      },
      {
        source: '',
        output: '',
        errorCount: 0,
        warningCount: 0,
        isBinary: false,
        filePath: '',
        fromCache: false,
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
        isBinary: false,
        filePath: '',
        fromCache: false,
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
              type: ElintPluginType.Linter
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
      '  ' +
        chalk.yellow(`${figures.cross}`) +
        ` 2 problems (${chalk.red('0 errors')}, ${chalk.yellow('2 warnings')})`
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
        isBinary: false,
        filePath: '',
        fromCache: false,
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
              type: ElintPluginType.Linter
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
      '  ' +
        chalk.red(`${figures.cross}`) +
        ` 3 problems (${chalk.red('1 error')}, ${chalk.yellow('2 warnings')})`
    )
    result.push('\n')
    result.push('\n')

    expect(report(input)).toEqual(result.join(''))
  })
})
