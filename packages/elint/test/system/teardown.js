/**
 * 执行一些清理工作
 */

import os from 'os'
import path from 'path'
import fs from 'fs-extra'

const teardown = async () => {
  if (global.__VERDACCIO__) {
    global.__VERDACCIO__()
  }

  // CI 下不用执行清理
  if (process.env.CI) {
    return
  }

  const tmpDir = os.tmpdir()

  /**
   * 清理临时目录
   */
  const dir = path.join(tmpDir, 'elint_test_system')

  if (fs.existsSync(dir)) {
    console.log(`删除临时目录：${dir}`)
    fs.removeSync(dir)
  }
}

export default teardown
