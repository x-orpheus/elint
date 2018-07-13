'use strict'

const chalk = require('chalk');
const figures = require('figures')
const report = require('../../../src/utils/report')

const chai = require('chai')
chai.should()

describe('Report 测试', function () {
  it('单条成功', function () {
    const input = [
      {
        name: 'name',
        output: 'output',
        success: true
      }
    ]

    const except = [];

    except.push('\n')
    except.push(`${chalk.bold(`> name:`)}\n`)
    except.push('\n')
    except.push('  output')
    except.push('\n')

    except.push('\n')

    report(input).should.be.equal(except.join(''))
  })

  it('单条成功, output 为空', function () {
    const input = [
      {
        name: 'name',
        output: '',
        success: true
      }
    ]

    const except = [];

    except.push('\n')
    except.push(`${chalk.bold(`> name:`)}\n`)
    except.push('\n')
    except.push('  ' + chalk.green(`${figures.tick} Passed`))
    except.push('\n')

    except.push('\n')

    report(input).should.be.equal(except.join(''))
  })

  it('单条成功, 输出包含换行', function () {
    const input = [
      {
        name: 'name',
        output: 'output\noutput',
        success: true
      }
    ]

    const except = [];

    except.push('\n')
    except.push(`${chalk.bold(`> name:`)}\n`)
    except.push('\n')
    except.push('  output\n  output')
    except.push('\n')

    except.push('\n')

    report(input).should.be.equal(except.join(''))
  })

  it('多条成功', function () {
    const input = [
      {
        name: 'name1',
        output: 'output1',
        success: true
      },
      {
        name: 'name2',
        output: 'output2',
        success: true
      }
    ]

    const except = [];

    except.push('\n')
    except.push(`${chalk.bold(`> name1:`)}\n`)
    except.push('\n')
    except.push('  output1')
    except.push('\n')

    except.push('\n')
    except.push(`${chalk.bold(`> name2:`)}\n`)
    except.push('\n')
    except.push('  output2')
    except.push('\n')

    except.push('\n')

    report(input).should.be.equal(except.join(''))
  })

  it('单条失败', function () {
    const input = [
      {
        name: 'name',
        output: 'output',
        success: false
      }
    ]

    const except = [];

    except.push('\n')
    except.push(`${chalk.bold(`> name:`)}\n`)
    except.push('\n')
    except.push('  output')
    except.push('\n')

    except.push('\n')

    report(input).should.be.equal(except.join(''))
  })
})
