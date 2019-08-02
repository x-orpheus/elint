'use strict'

const path = require('path')
const fs = require('fs-extra')
const { getBaseDir } = require('../../../src/env')

/**
 * 更改一个文件（末尾加一个空行）
 * 主要用在 git 相关的测试中
 */

async function appendFile (filePaths) {
  const baseDir = getBaseDir()

  for (let i = 0, j = filePaths.length; i < j; i++) {
    const filePath = path.join(baseDir, filePaths[i])
    await fs.appendFile(filePath, '\n')
  }
}

module.exports = appendFile
