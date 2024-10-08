import fs from 'fs-extra'
import path from 'node:path'
import { install } from '../../../src/core/install.js'
import { getBaseDir } from '../../../src/env.js'
import mock from '../mock/env.js'
import { mockElintPreset } from '../mock/mocks.js'

describe('preset install', () => {
  let unmock: () => void
  let baseDir: string

  beforeAll(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterAll(() => {
    unmock()
  })

  test('install', async () => {
    const errorMap = await install({
      preset: 'elint-preset-normal',
      cwd: baseDir
    })

    expect(errorMap).toBeEmpty()

    const eslintrcExists = fs.existsSync(path.resolve(baseDir, '.eslintrc.js'))
    const stylelintrcExists = fs.existsSync(
      path.resolve(baseDir, '.stylelintrc.js')
    )

    expect(eslintrcExists).toBeTrue()
    expect(stylelintrcExists).toBeFalse()
  })

  test('install local preset', async () => {
    await expect(
      install({
        preset: mockElintPreset,
        cwd: baseDir
      })
    ).toReject()
  })

  test('install unknown preset', async () => {
    await expect(
      install({
        preset: 'elint-preset-error',
        cwd: baseDir
      })
    ).toReject()
  })
})
