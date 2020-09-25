'use strict'

const mock = require('../mock/env')
const walker = require('../../../src/walker/local')

describe('Walker local 测试', () => {
  let unmock

  beforeEach(() => {
    unmock = mock()
  })

  afterEach(() => {
    unmock()
  })

  test('空测试', async () => {
    const result1 = await walker()
    const result2 = await walker([])

    expect(result1).toEqual([])
    expect(result2).toEqual([])
  })

  test('单条 glob', async () => {
    const expected = [
      'src/a.js'
    ]

    const result = await walker('src/*.js')

    expect(result).toEqual(expected)
  })

  test('单条 glob, 匹配空', async () => {
    const expected = []
    const result = await walker('src/*.ts')

    expect(result).toEqual(expected)
  })

  test('单条 glob, deep', async () => {
    const expected = [
      'src/a.js',
      'src/lib/b.js'
    ]

    const result = await walker('src/**/*.js')

    expect(result.sort()).toEqual(expected.sort())
  })

  test('单条 glob, deep', async () => {
    const expected = [
      'src/a.css',
      'src/a.js',
      'src/index.html',
      'src/lib/b.js'
    ]

    const result = await walker('src/**/*')

    expect(result.sort()).toEqual(expected.sort())
  })

  test('多条 glob', async () => {
    const expected = [
      'src/a.css',
      'src/a.js'
    ]

    const result = await walker(['src/*.js', 'src/*.css'])

    expect(result.sort()).toEqual(expected.sort())
  })

  test('多条 glob, 匹配空', async () => {
    const expected = []

    const result = await walker(['src/**/*.ts', 'dist/**/*.ts'])

    expect(result).toEqual(expected)
  })

  test('多条 glob, deep', async () => {
    const expected = [
      'src/a.css',
      'src/a.js',
      'src/lib/b.js'
    ]

    const result = await walker(['src/**/*.js', 'src/**/*.css'])

    expect(result.sort()).toEqual(expected.sort())
  })
})
