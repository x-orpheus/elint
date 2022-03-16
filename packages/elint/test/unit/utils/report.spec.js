'use strict'

const chalk = require('chalk')
const figures = require('figures')
const report = require('../../../src/utils/report')

describe('Report 测试', () => {
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

    expect(report(input)).toEqual(result.join(''))
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

    expect(report(input)).toEqual(result.join(''))
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

    expect(report(input)).toEqual(result.join(''))
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

    expect(report(input)).toEqual(result.join(''))
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

    expect(report(input)).toEqual(result.join(''))
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

    expect(report(input)).toEqual(result.join(''))
  })
})
