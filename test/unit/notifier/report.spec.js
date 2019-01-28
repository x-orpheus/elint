'use strict'

const report = require('../../../src/notifier/report')

const chai = require('chai')
const should = chai.should()

describe('Report 测试', function () {
  ;[true, 1, undefined, null, {}, () => {}].map(value => {
    it(`异常输入 ${JSON.stringify(value)}`, function () {
      return should.not.exist(report(value))
    })
  })

  it('正常输入', function () {
    const value = {
      name: 'name',
      current: '1.2.3',
      latest: '4.5.6'
    }

    const result = report(value)

    return (
      result.should.be.include(value.name) &&
      result.should.be.include(value.current) &&
      result.should.be.include(value.latest)
    )
  })
})
