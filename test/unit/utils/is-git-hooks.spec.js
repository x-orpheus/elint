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
    // appveyor 总是超时，延长
    this.timeout(5000)

    return isGitHooks().should.eventually.equal(false)
  })

  it('husky 环境', function () {
    // 模拟 husky 环境比较耗时，防止超时
    this.timeout(5000)

    const tmpl = `
      const isGitHooks = require('${isGitHooksPath}');
      isGitHooks().then(result => {
        process.stdout.write(JSON.stringify(result));
      });
    `

    return runInHusky(tmpl).should.eventually.equal('"true"')
  })
})
