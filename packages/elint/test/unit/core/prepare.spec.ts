import { prepare } from '../../../src/core/prepare.js'
import { getBaseDir } from '../../../src/env.js'
import mock from '../mock/env.js'
import { mockElintPlugin, mockElintPreset } from '../mock/mocks.js'

describe('preset prepare', () => {
  let unmock: () => void
  let baseDir: string

  beforeAll(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterAll(() => {
    unmock()
  })

  test('prepare', async () => {
    const errorMap = await prepare({
      preset: mockElintPreset
    })

    expect(errorMap).toBeEmpty()
  })

  test('prepare with error', async () => {
    const errorMap = await prepare({
      cwd: baseDir,
      preset: {
        plugins: [
          {
            ...mockElintPlugin,
            prepare: () => {
              throw new Error()
            }
          }
        ]
      }
    })

    expect(errorMap[mockElintPlugin.name]).not.toBeUndefined()
  })
})
