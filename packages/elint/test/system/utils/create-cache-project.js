import fs from 'fs-extra'
import run from './run.js'
import {
  cacheDir,
  backupDir,
  testProjectDir,
  verdaccioPort
} from './variable.js'

// 创建缓存项目：方便后面重复使用
async function createCacheProject() {
  const dirExists = await fs.pathExists(cacheDir)

  if (dirExists) {
    await fs.emptyDir(cacheDir)
  }

  // 创建缓存项目
  await fs.copy(testProjectDir, cacheDir)

  await run(
    `npm install --silent --registry=http://localhost:${verdaccioPort}`,
    cacheDir
  )

  // 创建备份
  await fs.copy(cacheDir, backupDir, {
    filter: (src) => !src.includes('node_modules')
  })
}

export default createCacheProject
