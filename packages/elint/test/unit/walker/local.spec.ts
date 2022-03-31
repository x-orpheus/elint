import mock from '../mock/env.js'
import walker from '../../../src/walker/local.js'
import { getBaseDir } from '../../../src/env.js'

describe('Walker local 测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
  })

  test('空测试', async () => {
    const result = await walker([], undefined, baseDir)

    expect(result).toEqual([])
  })

  test('单条 glob', async () => {
    const expected = ['src/a.js']

    const result = await walker(['src/*.js'], undefined, baseDir)

    expect(result).toEqual(expected)
  })

  test('单条 glob, 匹配空', async () => {
    const expected: string[] = []
    const result = await walker(['src/*.ts'], undefined, baseDir)

    expect(result).toEqual(expected)
  })

  test('单条 glob, deep', async () => {
    const expected = ['src/a.js', 'src/lib/b.js']

    const result = await walker(['src/**/*.js'], undefined, baseDir)

    expect(result).toIncludeSameMembers(expected)
  })

  test('单条 glob, deep', async () => {
    const expected = ['src/a.css', 'src/a.js', 'src/index.html', 'src/lib/b.js']

    const result = await walker(['src/**/*'], undefined, baseDir)

    expect(result).toIncludeSameMembers(expected)
  })

  test('多条 glob', async () => {
    const expected = ['src/a.css', 'src/a.js']

    const result = await walker(['src/*.js', 'src/*.css'], undefined, baseDir)

    expect(result).toIncludeSameMembers(expected)
  })

  test('多条 glob, 匹配空', async () => {
    const expected: string[] = []

    const result = await walker(
      ['src/**/*.ts', 'dist/**/*.ts'],
      undefined,
      baseDir
    )

    expect(result).toEqual(expected)
  })

  test('多条 glob, deep', async () => {
    const expected = ['src/a.css', 'src/a.js', 'src/lib/b.js']

    const result = await walker(
      ['src/**/*.js', 'src/**/*.css'],
      undefined,
      baseDir
    )

    expect(result).toIncludeSameMembers(expected)
  })
})
