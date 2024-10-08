import path from 'node:path'
import fs from 'fs-extra'
import { getBaseDir } from '../../../src/env.js'

/**
 * 更改一个文件（末尾加一个空行）
 * 主要用在 git 相关的测试中
 */

async function appendFile(filePaths: string[]) {
  const baseDir = getBaseDir()

  for (let i = 0, j = filePaths.length; i < j; i++) {
    const filePath = path.join(baseDir, filePaths[i])
    await fs.appendFile(filePath, '\n')
  }
}

export default appendFile
