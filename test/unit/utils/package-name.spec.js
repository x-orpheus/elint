'use strict'

const { parse, stringify, normalize } = require('../../../src/utils/package-name')

const chai = require('chai')
const should = chai.should()

describe('Package name 测试', function () {
  describe('parse 测试', function () {
    it('空测试', function () {
      should.not.exist(parse())
      should.not.exist(parse(''))
    })

    it('各种非法测试', function () {
      should.not.exist(parse('asdf/asdf'))
      should.not.exist(parse('@asdf@asdf'))
      should.not.exist(parse('@asdf@asdf@v1.1.1'))
      should.not.exist(parse('asdfaf/asdf'))
      should.not.exist(parse('asdf/1.1.1'))
    })

    it('name 测试', function () {
      parse('name').should.deep.equal({
        name: 'elint-preset-name',
        scope: '',
        version: ''
      })
      parse('n-a-m_e').should.deep.equal({
        name: 'elint-preset-n-a-m_e',
        scope: '',
        version: ''
      })
    })

    it('name + scope 测试', function () {
      parse('@scope/name').should.deep.equal({
        name: 'elint-preset-name',
        scope: 'scope',
        version: ''
      })
    })

    it('name + version 测试', function () {
      parse('name@asdf').should.deep.equal({
        name: 'elint-preset-name',
        scope: '',
        version: 'asdf'
      })
      parse('name@1.1.1-bate').should.deep.equal({
        name: 'elint-preset-name',
        scope: '',
        version: '1.1.1-bate'
      })
    })

    it('name + scope + version 测试', function () {
      parse('@asdf/name@asdf').should.deep.equal({
        scope: 'asdf',
        name: 'elint-preset-name',
        version: 'asdf'
      })
      parse('@asd-asdf/name@1.1.1-bate').should.deep.equal({
        scope: 'asd-asdf',
        name: 'elint-preset-name',
        version: '1.1.1-bate'
      })
    })
  })

  describe('stringify 测试', function () {
    it('name', function () {
      stringify({
        name: 'test'
      }).should.equal('test')
    })

    it('name + scope', function () {
      stringify({
        name: 'test',
        scope: 'scope'
      }).should.equal('@scope/test')
    })

    it('name + version', function () {
      stringify({
        name: 'test',
        version: '1.2.3'
      }).should.equal('test@1.2.3')
    })

    it('name + scope + version', function () {
      stringify({
        name: 'test',
        scope: 'scope',
        version: '1.2.3'
      }).should.equal('@scope/test@1.2.3')
    })
  })

  describe('Normalize 测试', function () {
    it('空测试', function () {
      const name1 = undefined
      const name2 = ''

      should.not.exist(normalize(name1))
      normalize(name2).should.equal(name2)
    })

    it('正常情况', function () {
      normalize('name').should.equal('elint-preset-name')
      normalize('elint-preset-name').should.equal('elint-preset-name')
      normalize('elint-preset-na-me').should.equal('elint-preset-na-me')
    })
  })
})
