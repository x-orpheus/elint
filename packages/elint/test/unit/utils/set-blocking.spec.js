'use strict'

const path = require('path')
const fs = require('fs-extra')
const execa = require('execa')
const mock = require('../mock/env')
const { getBaseDir } = require('../../../src/env')
const setBlockingPath = require.resolve('../../../src/utils/set-blocking')

let unmock
let baseDir

describe('set-blocking 测试', () => {
  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
    baseDir = null
  })

  test('测试长输出不被截断', async () => {
    // 创建测试文件
    const filePath = path.join(baseDir, 'child.js')

    await fs.writeFile(filePath, `
      const setBlocking = require("${setBlockingPath}");

      let buffer = "";
      for (let i = 0; i < 3000; i++) {
        buffer += "line " + i + "\\n";
      }

      setBlocking(true);
      process.stdout.write(buffer);
      process.exit(0);
    `.replace(/\\/g, '\\\\'))

    const result = await execa('node', [filePath])

    expect(result.stdout).toMatch(/line 2999/)
  })
})
