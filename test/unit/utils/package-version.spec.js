'use strict'

const packageVersion = require('../../../src/utils/package-version')

const chai = require('chai')
chai.should()

describe('Package version 测试', function () {
  it('空测试', function () {
    packageVersion().should.be.equal('latest')
    packageVersion('').should.be.equal('latest')
  })

  it('常规测试', function () {
    packageVersion('1.1.1').should.be.equal('1.1.1')
    packageVersion('~1.1.1').should.be.equal('1.1.1')
    packageVersion('^1.1.1').should.be.equal('1.1.1')
    packageVersion('1.1.1-beta.1').should.be.equal('1.1.1-beta.1')
  })
})
