import fs from 'fs-extra'
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

    await run('git init', cacheDir)
    await run('git config user.name "zhang san"', cacheDir)
    await run('git config user.email "zhangsan@gmail.com"', cacheDir)
    await run(
      'git commit --allow-empty -m "build: initial empty commit"',
      cacheDir
    )

    await run(
      `npm install --silent --registry=http://localhost:${verdaccioPort}`,
      cacheDir
    )
  }

  // 创建备份
  await fs.copy(cacheDir, backupDir, {
    filter: (src) => !src.includes('node_modules')
  })
}

export default createCacheProject
