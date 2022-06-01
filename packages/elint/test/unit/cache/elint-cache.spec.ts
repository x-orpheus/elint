import mock from '../mock/env.js'
import { getElintCache } from '../../../src/cache/index.js'
import ELintCache, {
  type ElintCacheOptions
} from '../../../src/cache/elint-cache.js'
import { loadPresetAndPlugins } from '../../../src/elint.js'
import type { InternalLoadedPresetAndPlugins } from '../../../src/types.js'
import { getBaseDir } from '../../../src/env.js'
import { mockElintPreset } from '../mock/mocks.js'
import path from 'path'

describe('测试 elint cache 功能', () => {
  let unmock: () => void
  let baseDir: string
  let internalLoadedPresetAndPlugins: InternalLoadedPresetAndPlugins

  beforeAll(async () => {
    unmock = mock()
    baseDir = getBaseDir()
    internalLoadedPresetAndPlugins = await loadPresetAndPlugins({
      preset: mockElintPreset,
      cwd: baseDir
    })
  })

  afterAll(() => {
    unmock()
  })

  test('测试 getPresetString', () => {
    expect(ELintCache.getPresetString(internalLoadedPresetAndPlugins)).toBe(
      'anonymous@unknown'
    )
  })

  test('测试无缓存状态', async () => {
    const elintCache = getElintCache({ cwd: baseDir })

    const elintCacheOptions: ElintCacheOptions = {
      internalLoadedPresetAndPlugins,
      fix: true,
      write: true
    }

    const fileChanged = elintCache.getFileCache(
      path.join(baseDir, 'src/a.js'),
      elintCacheOptions
    )

    expect(fileChanged).toBe(false)

    const fileNotFound = elintCache.getFileCache(
      path.join(baseDir, 'src/not-found.js'),
      elintCacheOptions
    )

    expect(fileNotFound).toBe(false)
  })

  test('设置文件缓存', () => {
    const elintCache = getElintCache({ cwd: baseDir })

    const elintCacheOptions: ElintCacheOptions = {
      internalLoadedPresetAndPlugins,
      fix: true,
      write: true
    }

    const filePath = path.join(baseDir, 'src/a.js')

    elintCache.setFileCache(
      {
        filePath,
        errorCount: 0,
        warningCount: 0,
        source: '',
        output: '',
        pluginResults: []
      },
      elintCacheOptions
    )

    elintCache.reconcile()

    // 成功 lint，写入缓存
    const touched = elintCache.getFileCache(filePath, elintCacheOptions)

    expect(touched).toBeTrue()

    // preset 发生变化，缓存未命中
    const missedWhenPresetChange = elintCache.getFileCache(filePath, {
      ...elintCacheOptions,
      internalLoadedPresetAndPlugins: {
        ...internalLoadedPresetAndPlugins,
        internalPreset: {
          ...internalLoadedPresetAndPlugins.internalPreset,
          name: 'change'
        }
      }
    })

    expect(missedWhenPresetChange).toBeFalse()

    // fix = true 且 write = false 会让缓存失效，删除文件缓存
    elintCache.setFileCache(
      {
        filePath,
        errorCount: 0,
        warningCount: 0,
        source: '',
        output: '',
        pluginResults: []
      },
      {
        ...elintCacheOptions,
        fix: true,
        write: false
      }
    )

    elintCache.reconcile()

    const missedWhenFixButNotWrite = elintCache.getFileCache(filePath, {
      ...elintCacheOptions,
      fix: true,
      write: false
    })

    expect(missedWhenFixButNotWrite).toBeFalse()

    // 缓存已经被删除后，再次获取依然是未命中
    const notTouchedAfterRemove = elintCache.getFileCache(
      filePath,
      elintCacheOptions
    )

    expect(notTouchedAfterRemove).toBeFalse()
  })
})
