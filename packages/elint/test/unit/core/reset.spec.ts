import { reset } from '../../../src/core/reset.js'
import { getBaseDir } from '../../../src/env.js'
import mock from '../mock/env.js'
import { mockElintPlugin, mockElintPreset } from '../mock/mocks.js'

describe('preset reset', () => {
  let unmock: () => void
  let baseDir: string

  beforeAll(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterAll(() => {
    unmock()
  })

  test('reset', async () => {
    const errorMap = await reset({
      preset: mockElintPreset
    })

    expect(errorMap).toBeEmpty()
  })

  test('reset with error', async () => {
    const errorMap = await reset({
      cwd: baseDir,
      preset: {
        plugins: [
          {
            ...mockElintPlugin,
            reset: () => {
              throw new Error()
            }
          }
        ]
      }
    })

    expect(errorMap[mockElintPlugin.name]).not.toBeUndefined()
  })
})
