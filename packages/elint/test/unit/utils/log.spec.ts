import { jest } from '@jest/globals'
import chalk from 'chalk'
import figures from 'figures'
import log from '../../../src/utils/log.js'

const { error, success, info, warn } = log

let spy: jest.SpyInstance

describe('log 测试', () => {
  beforeEach(() => {
    spy = jest.spyOn(global.console, 'log').mockImplementation(() => {
      // empty
    }) as jest.SpyInstance
  })

  afterEach(() => {
    spy.mockRestore()
  })

  it('空测试', () => {
    error()
    expect(spy).not.toBeCalled()
  })

  it('单条信息', () => {
    const message = 'hello world!'
    const expected = chalk.red(`\n  ${figures.cross} ${message}\n`)

    error('hello world!')

    expect(spy).toHaveBeenCalledWith(expected)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('多条信息', () => {
    const message = ['hello', 'world!']
    const expected = chalk.red(
      `\n  ${figures.cross} ${message[0]}\n    ${message[1]}\n`
    )

    error(...message)

    expect(spy).toHaveBeenCalledWith(expected)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('多类型测试', () => {
    const message = ['hello', 'world!']

    const errorExcepted = chalk.red(
      `\n  ${figures.cross} ${message[0]}\n    ${message[1]}\n`
    )
    const successExcepted = chalk.green(
      `\n  ${figures.tick} ${message[0]}\n    ${message[1]}\n`
    )
    const infoExcepted = chalk.blue(
      `\n  ${figures.info} ${message[0]}\n    ${message[1]}\n`
    )
    const warnExcepted = chalk.yellow(
      `\n  ${figures.warning} ${message[0]}\n    ${message[1]}\n`
    )

    error(...message)
    success(...message)
    info(...message)
    warn(...message)

    expect(spy).toHaveBeenNthCalledWith(1, errorExcepted)
    expect(spy).toHaveBeenNthCalledWith(2, successExcepted)
    expect(spy).toHaveBeenNthCalledWith(3, infoExcepted)
    expect(spy).toHaveBeenNthCalledWith(4, warnExcepted)
    expect(spy).toHaveBeenCalledTimes(4)
  })
})
