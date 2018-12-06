'use strict'

const mock = require('../mock/env')
const runInHusky = require('../mock/run-in-husky')
const isGitHooks = require('../../../src/utils/is-git-hooks')
const isGitHooksPath = require.resolve('../../../src/utils/is-git-hooks.js')

const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
chai.should()
chai.use(chaiAsPromised)

let unmock

describe('is-git-hooks 测试', function () {
  beforeEach(() => {
    unmock = mock()
  })

  afterEach(() => {
    unmock()
  })

  it('非 husky 环境', function () {
    return isGitHooks().should.eventually.equal(false)
  })

  it('husky 环境', function () {
    const tmpl = `
      const isGitHooks = require('${isGitHooksPath}');
      isGitHooks().then(result => {
        process.stdout.write(JSON.stringify(result));
      });
    `

    return runInHusky(tmpl).should.eventually.equal('"true"')
  })
})
