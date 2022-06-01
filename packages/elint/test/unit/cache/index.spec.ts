import path from 'path'
import {
  getElintCachePath,
  getElintCache,
  resetElintCache
} from '../../../src/cache/index.js'
import { getBaseDir } from '../../../src/env.js'
import mock from '../mock/env.js'

describe('cache 测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
  })

  test('测试缓存路径', () => {
    expect(getElintCachePath({ cwd: baseDir })).toBe(
      path.join(baseDir, 'node_modules/.cache/.elintcache')
    )

    expect(
      getElintCachePath({ cwd: path.join(baseDir, 'bower_components') })
    ).toBe(path.join(baseDir, 'bower_components/.cache/.elintcache'))

    expect(getElintCachePath({ cwd: baseDir, cacheLocation: '.test/' })).toBe(
      path.join(baseDir, '.test/.elintcache')
    )

    expect(getElintCachePath({ cwd: baseDir, cacheLocation: '.test' })).toBe(
      path.join(baseDir, '.test')
    )
  })

  test('测试缓存实例', () => {
    const elintCache = getElintCache({ cwd: baseDir })

    expect(elintCache).not.toBeUndefined()
  })

  test('测试缓存清空', () => {
    expect(() => {
      resetElintCache({ cwd: baseDir })
    }).not.toThrow()
  })
})
