'use strict'

const mock = require('../mock/env')
const walker = require('../../../src/walker/local')

const deepEqualInAnyOrder = require('deep-equal-in-any-order')
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
chai.use(deepEqualInAnyOrder)
chai.use(chaiAsPromised)
chai.should()

describe('Walker local 测试', function () {
  let unmock

  beforeEach(() => {
    unmock = mock()
  })

  afterEach(() => {
    unmock()
  })

  it('空测试', function () {
    return Promise.all([
      walker().should.eventually.deep.equalInAnyOrder([]),
      walker([]).should.eventually.deep.equalInAnyOrder([])
    ])
  })

  it('单条 glob', function () {
    const result = [
      'src/a.js'
    ]

    return walker('src/*.js').should.eventually.deep.equalInAnyOrder(result)
  })

  it('单条 glob, 匹配空', function () {
    return walker('src/*.ts').should.eventually.deep.equalInAnyOrder([])
  })

  it('单条 glob, deep', function () {
    const result = [
      'src/a.js',
      'src/lib/b.js'
    ]

    return walker('src/**/*.js').should.eventually.deep.equalInAnyOrder(result)
  })

  it('单条 glob, deep', function () {
    const result = [
      'src/a.css',
      'src/a.js',
      'src/index.html',
      'src/lib/b.js'
    ]

    return walker('src/**/*').should.eventually.deep.equalInAnyOrder(result)
  })

  it('多条 glob', function () {
    const result = [
      'src/a.css',
      'src/a.js'
    ]

    return walker(['src/*.js', 'src/*.css']).should.eventually.deep.equalInAnyOrder(result)
  })

  it('多条 glob, 匹配空', function () {
    return walker(['src/**/*.ts', 'dist/**/*.ts']).should.eventually.deep.equalInAnyOrder([])
  })

  it('多条 glob, deep', function () {
    const result = [
      'src/a.css',
      'src/a.js',
      'src/lib/b.js'
    ]

    return walker(['src/**/*.js', 'src/**/*.css']).should.eventually.deep.equalInAnyOrder(result)
  })
})
