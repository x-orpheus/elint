/**
 * 执行一些准备工作
 */

import os from 'os'
import run from './utils/run.js'
import {
  startUpLocalRegistry,
  publishToLocalRegistry,
  cleanLocalRegistry
} from './utils/local-registry.js'
import createCacheProject from './utils/create-cache-project.js'
import {
  projectDir,
  publishPackageList,
  publishPackagePathList
} from './utils/variable.js'

const init = async () => {
  // 输出 CPU 和内存信息
  console.log('=== OS Info ===')
  console.log(`CPU count: ${os.cpus().length}`)
  console.log(`Memory: ${Math.ceil(os.totalmem() / 1024 / 1024 / 1024)}G`)
  console.log()

  const verdaccioTeardown = await startUpLocalRegistry()

  global.__VERDACCIO__ = verdaccioTeardown

  await run('pnpm run clean', projectDir)

  await run('pnpm run build', projectDir)

  // verdaccio 不支持同版本号覆盖
  await Promise.all(
    publishPackageList.map((packageName) => cleanLocalRegistry(packageName))
  )

  await Promise.all(
    publishPackagePathList.map((packagePath) =>
      publishToLocalRegistry(packagePath)
    )
  )

  // 创建缓存项目
  await createCacheProject()
}

export default init
