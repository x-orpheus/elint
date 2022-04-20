import mock from '../mock/env.js'
import { getBaseDir } from '../../../src/env.js'
import {
  loadElintPreset,
  tryLoadElintPreset
} from '../../../src/preset/load.js'

describe('preset 加载测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeAll(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterAll(() => {
    unmock()
  })

  test('无 preset 加载', async () => {
    expect(async () => {
      await loadElintPreset(undefined as unknown as string, {
        cwd: baseDir
      })
    }).rejects.toThrow()
  })

  test('加载不存在的 preset', async () => {
    await expect(async () => {
      await loadElintPreset('elint-preset-unknown', {
        cwd: baseDir
      })
    }).rejects.toThrow()
  })

  test('加载非 preset', async () => {
    await expect(async () => {
      await loadElintPreset('elint-plugin-esm', {
        cwd: baseDir
      })
    }).rejects.toThrow()
  })

  test('正常加载 preset', async () => {
    const preset = await loadElintPreset('elint-preset-normal', {
      cwd: baseDir
    })

    expect(preset.name).toEqual('elint-preset-normal')
  })

  test('尝试加载多个 preset', async () => {
    await expect(async () => {
      await tryLoadElintPreset(/elint-preset-/, {
        cwd: baseDir
      })
    }).rejects.toThrow()
  })

  test('尝试加载一个 preset', async () => {
    const preset = await tryLoadElintPreset(/elint-preset-normal/, {
      cwd: baseDir
    })

    expect(preset.name).toEqual('elint-preset-normal')
  })

  test('尝试加载不存在的 preset', async () => {
    await expect(async () => {
      await tryLoadElintPreset(/elint-preset-unknown/, {
        cwd: baseDir
      })
    }).rejects.toThrow()
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
})
