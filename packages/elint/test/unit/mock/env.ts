import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'fs-extra'

const origin = process.env.INIT_CWD

function mock() {
  /**
   * 创建测试项目
   */
  const tempDir = path.join(
    os.tmpdir(),
    `elint_tmp_${Math.random().toString().substr(2)}`
  )

  const testProjectDir = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '../test-project'
  )

  fs.ensureDirSync(tempDir)
  fs.copySync(testProjectDir, tempDir)

  /**
   * mock env.js baseDir
   */
  process.env.INIT_CWD = tempDir

  return () => {
    fs.removeSync(tempDir)
    process.env.INIT_CWD = origin
  }
}

export default mock
