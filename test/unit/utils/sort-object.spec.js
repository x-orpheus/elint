'use strict'

const sort = require('../../../src/utils/sort-object')

const chai = require('chai')
const should = chai.should()

describe('Sort Object 测试', function () {
  it('空测试', function () {
    should.not.exist(sort())
    sort('').should.be.equal('')
  })

  it('sort', function () {
    const object = {
      'is-valid-glob': '*',
      co: '*',
      ignore: '*',
      chalk: '*',
      'write-json-file': '*',
      '@commitlint/core': '*'
    }

    const result = {
      '@commitlint/core': '*',
      chalk: '*',
      co: '*',
      ignore: '*',
      'is-valid-glob': '*',
      'write-json-file': '*'
    }

    sort(object).should.be.deep.equal(result)
  })
})
