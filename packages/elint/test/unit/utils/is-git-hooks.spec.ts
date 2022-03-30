import { createRequire } from 'module'
import mock from '../mock/env.js'
import runInHusky from '../mock/run-in-husky.js'
import isGitHooks from '../../../src/utils/is-git-hooks.js'

const require = createRequire(import.meta.url)
const isGitHooksPath = require
  .resolve('../../../src/utils/is-git-hooks')
  .replace('.ts', '.js')

describe('is-git-hooks 测试', () => {
  let unmock: () => void

  beforeEach(() => {
    unmock = mock()
  })

  afterEach(() => {
    unmock()
  })

  test('非 husky 环境', async () => {
    const expected = await isGitHooks()
    expect(expected).toEqual(false)
  })

  test('husky 环境', async () => {
    const tmpl = `
      import isGitHooks from '${isGitHooksPath}';

      isGitHooks().then(result => {
        process.stdout.write(JSON.stringify(result));
      });
    `

    const expected = await runInHusky(tmpl)

    expect(expected).toEqual('"true"')
  })
})
