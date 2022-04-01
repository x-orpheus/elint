import report from '../../../src/notifier/report.js'

describe('Report 测试', () => {
  test('正常输入', function () {
    const value = {
      name: 'name',
      current: '1.2.3',
      latest: '4.5.6'
    }

    const result = report(value)

    expect(result).toContain(value.name)
    expect(result).toContain(value.current)
    expect(result).toContain(value.latest)
  })
})
