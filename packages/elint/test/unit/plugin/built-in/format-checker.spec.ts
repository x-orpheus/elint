import chalk from 'chalk'
import formatChecker from '../../../../src/plugin/built-in/format-checker.js'
import { testElintPlugin } from '../../../../src/plugin/test.js'

describe('样式检查插件测试', () => {
  test('代码一致', async () => {
    const result = await testElintPlugin('test1', formatChecker, {
      fix: false,
      source: 'test1',
      cwd: ''
    })

    expect(result?.errorCount).toBe(0)
    expect(result?.message).toBeUndefined()
  })

  test('代码不一致', async () => {
    const result = await testElintPlugin('test1', formatChecker, {
      fix: false,
      source: 'test2',
      cwd: ''
    })

    expect(result?.errorCount).toBe(1)
    expect(result?.message).toBe(`${chalk.red.bold('!')} Not formatted\n\n`)
  })

  test('代码不一致，传入 filePath', async () => {
    const result = await testElintPlugin('test1', formatChecker, {
      fix: false,
      source: 'test2',
      cwd: '',
      filePath: 'filePath'
    })

    expect(result?.message).toBe(
      `${chalk.underline('filePath')}\n  ${chalk.red.bold(
        '!'
      )} Not formatted\n\n`
    )
  })

  test('fix 模式代码不一致', async () => {
    const result = await testElintPlugin('test1', formatChecker, {
      fix: true,
      source: 'test2',
      cwd: ''
    })

    expect(result?.errorCount).toBe(0)
  })
})
