'use strict'

const padEnd = require('../../../src/utils/pad-end')

describe('PadEnd 测试', () => {
  test('空测试', () => {
    expect(padEnd()).toBeFalsy()
    expect(padEnd(undefined)).toBeFalsy()
    expect(padEnd(null)).toBeFalsy()

    expect(padEnd('')).toEqual('')
    expect(padEnd(0)).toEqual(0)
    expect(padEnd(1)).toEqual(1)
  })

  test('length 大于字符串长度', () => {
    expect(padEnd('123', 8)).toEqual('123     ')
    expect(padEnd('123456', 8)).toEqual('123456  ')
  })

  test('length 小于字符串长度', () => {
    expect(padEnd('123456', 5)).toEqual('123456')
    expect(padEnd('123456', 2)).toEqual('123456')
  })
})
