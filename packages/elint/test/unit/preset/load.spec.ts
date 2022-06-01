import path from 'path'
import mock from '../mock/env.js'
import { getBaseDir } from '../../../src/env.js'
import {
  loadElintPreset,
  tryLoadElintPreset
} from '../../../src/preset/load.js'

describe('preset 加载测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
  })

  test('无 preset 加载', async () => {
    await expect(
      loadElintPreset(undefined as unknown as string, {
        cwd: baseDir
      })
    ).toReject()
  })

  test('加载不存在的 preset', async () => {
    await expect(
      loadElintPreset('elint-preset-unknown', {
        cwd: baseDir
      })
    ).toReject()
  })

  test('加载非 preset', async () => {
    await expect(
      loadElintPreset('elint-plugin-esm', {
        cwd: baseDir
      })
    ).toReject()
  })

  test('正常加载 preset', async () => {
    const preset = await loadElintPreset('elint-preset-normal', {
      cwd: baseDir
    })

    expect(preset.name).toEqual('elint-preset-normal')
  })

  test('尝试加载多个 preset', async () => {
    await expect(
      tryLoadElintPreset(/elint-preset-/, {
        cwd: baseDir
      })
    ).toReject()
  })

  test('尝试加载一个 preset', async () => {
    const preset = await tryLoadElintPreset(/elint-preset-normal/, {
      cwd: baseDir
    })

    expect(preset.name).toEqual('elint-preset-normal')
  })

  test('尝试加载不存在的 preset', async () => {
    await expect(
      tryLoadElintPreset(/elint-preset-unknown/, {
        cwd: baseDir
      })
    ).toReject()
  })

  test('加载匿名 preset', async () => {
    const preset = await loadElintPreset(
      { plugins: [] },
      {
        cwd: baseDir
      }
    )

    expect(preset.name).toEqual('anonymous')
  })

  test('加载文件匿名 preset', async () => {
    const preset = await loadElintPreset(
      path.join(baseDir, 'bower_components', 'anonymous-preset.cjs'),
      {
        cwd: baseDir
      }
    )

    expect(preset.name).toEqual('anonymous')
  })

  test('加载文件不是 preset', async () => {
    await expect(
      loadElintPreset(
        path.join(baseDir, 'bower_components', 'not-preset.cjs'),
        {
          cwd: baseDir
        }
      )
    ).toReject()
  })
})
