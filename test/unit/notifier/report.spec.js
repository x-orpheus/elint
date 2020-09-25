'use strict'

const report = require('../../../src/notifier/report')

describe('Report 测试', () => {
  ;[true, 1, undefined, null, {}, () => {}].map(value => {
    test(`异常输入 ${JSON.stringify(value)}`, () => {
      expect(report(value)).toBeFalsy()
    })
  })

  test('正常输入', function () {
    const value = {
      name: 'name',
      current: '1.2.3',
      latest: '4.5.6'
    }

    const result = report(value)

    return (
      expect(result).toContain(value.name) &&
      expect(result).toContain(value.current) &&
      expect(result).toContain(value.latest)
    )
  })
})
