'use strict'

const mock = require('../mock/env')
const runInHusky = require('../mock/run-in-husky')
const isGitHooks = require('../../../src/utils/is-git-hooks')
const isGitHooksPath = require.resolve('../../../src/utils/is-git-hooks.js')

let unmock

describe('is-git-hooks 测试', () => {
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
      const isGitHooks = require('${isGitHooksPath}');
      isGitHooks().then(result => {
        process.stdout.write(JSON.stringify(result));
      });
    `

    const expected = await runInHusky(tmpl)
    expect(expected).toEqual('"true"')
  })
})
