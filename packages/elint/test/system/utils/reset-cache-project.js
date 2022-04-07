import fs from 'fs-extra'
// import { globby } from 'globby'
import { cacheDir, backupDir } from './variable.js'

// 重置缓存项目
async function resetCacheProject() {
  // 清理除了 node_modules 外的所有文件
  const files = []
  // const files = await globby(['*', '!node_modules'], {
  //   cwd: cacheDir,
  //   dot: true,
  //   onlyFiles: false,
  //   absolute: true
  // })

  for (const file of files) {
    await fs.remove(file)
  }

  // 使用备份恢复
  await fs.copy(backupDir, cacheDir, {
    overwrite: true
  })

  return cacheDir
}

export default resetCacheProject
