import fs from 'fs-extra'
import path from 'path'
import {
  bumpPackageVersion,
  loginLocalRegistry,
  publishToLocalRegistry
} from './local-registry.js'
import run from './run.js'
import {
  cacheDir,
  backupDir,
  testProjectDir,
  verdaccioPort,
  testPresetDir,
  tempTestPresetDir,
  publishPackagePathList,
  projectDir
} from './variable.js'

// 创建缓存项目：方便后面重复使用
async function createCacheProject(skipPreparation = false) {
  if (!skipPreparation) {
    const dirExists = await fs.pathExists(cacheDir)

    if (dirExists) {
      await fs.emptyDir(cacheDir)
    }
  }

  // 创建缓存项目
  await fs.copy(testProjectDir, cacheDir)

  await fs.copy(testPresetDir, tempTestPresetDir)

  if (!skipPreparation) {
    await run('pnpm run build', projectDir)

    // 登录本地 registry
    await loginLocalRegistry()

    await Promise.all(
      publishPackagePathList.map((packagePath) =>
        publishToLocalRegistry(packagePath)
      )
    )

    await publishToLocalRegistry(tempTestPresetDir)

    await bumpPackageVersion(tempTestPresetDir)

    await publishToLocalRegistry(tempTestPresetDir)

    if (process.env.CI) {
      const cacheNodeModulesDir = path.join(cacheDir, 'node_modules')
      const packageLockPath = path.join(cacheDir, 'package-lock.json')

      if (fs.existsSync(cacheNodeModulesDir)) {
        console.log(`删除缓存的依赖目录 ${cacheNodeModulesDir}`)
        fs.removeSync(cacheNodeModulesDir)
      }

      if (fs.existsSync(packageLockPath)) {
        console.log(`删除缓存的 lock 文件 ${packageLockPath}`)
        fs.removeSync(packageLockPath)
      }

      await run('npm cache clean --force', cacheDir)

      await run('npm cache verify', cacheDir)
    }

    await run(
      `npm install --registry=http://localhost:${verdaccioPort}`,
      cacheDir
    )
  }

  // 创建备份
  await fs.copy(cacheDir, backupDir, {
    filter: (src) => !src.includes('node_modules')
  })
}

export default createCacheProject
