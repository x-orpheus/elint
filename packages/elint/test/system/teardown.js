/**
 * 执行一些清理工作
 */

import fs from 'fs-extra'
import { systemTestTempDir } from './utils/variable.js'

const teardown = async () => {
  // CI 下不用执行清理
  if (process.env.CI) {
    return
  }

  /**
   * 清理临时目录
   */
  if (fs.existsSync(systemTestTempDir)) {
    console.log(`删除临时目录: ${systemTestTempDir}`)
    fs.removeSync(systemTestTempDir)
  }
}

export default teardown
