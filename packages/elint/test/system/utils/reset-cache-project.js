'use strict'

const fs = require('fs-extra')
const { globby } = require('globby')
const { cacheDir, cacheDirYarn, backupDir } = require('./variable')

// 重置缓存项目
async function resetCacheProject(useYarn = false) {
  const dir = useYarn ? cacheDirYarn : cacheDir

  // 清理除了 node_modules 外的所有文件
  const files = await globby(['*', '!node_modules'], {
    cwd: dir,
    dot: true,
    onlyFiles: false,
    absolute: true
  })

  for (const file of files) {
    await fs.remove(file)
  }

  // 使用备份恢复
  await fs.copy(backupDir, dir, {
    overwrite: true
  })

  return dir
}

module.exports = resetCacheProject
