'use strict'

const path = require('path')
const fs = require('fs-extra')
const execa = require('execa')
const mock = require('../mock/env')
const { getBaseDir } = require('../../../src/env')
const setBlockingPath = require.resolve('../../../src/utils/set-blocking')

const chai = require('chai')
chai.should()

let unmock
let baseDir

describe('set-blocking 测试', function () {
  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
    baseDir = null
  })

  it('测试长输出不被截断', function () {
    // 创建测试文件
    const filePath = path.join(baseDir, 'child.js')
    fs.writeFileSync(filePath, `
      const setBlocking = require("${setBlockingPath}");

      let buffer = "";
      for (let i = 0; i < 3000; i++) {
        buffer += "line " + i + "\\n";
      }

      setBlocking(true);
      process.stdout.write(buffer);
      process.exit(0);
    `.replace(/\\/g, '\\\\'))

    return execa('node', [filePath])
      .then(result => {
        result.stdout.should.match(/line 2999/)
      })
  })
})
