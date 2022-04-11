/**
 * 执行一些准备工作
 */

import os from 'os'
import run from './utils/run.js'
import { startUpLocalRegistry } from './utils/local-registry.js'
import createCacheProject from './utils/create-cache-project.js'
import { projectDir } from './utils/variable.js'

const init = async () => {
  // 输出 CPU 和内存信息
  console.log('=== OS Info ===')
  console.log(`CPU count: ${os.cpus().length}`)
  console.log(`Memory: ${Math.ceil(os.totalmem() / 1024 / 1024 / 1024)}G`)
  console.log()

  const closeVerdaccio = await startUpLocalRegistry()

  await run('pnpm run build', projectDir)

  // 创建缓存项目
  await createCacheProject()

  await closeVerdaccio()
}

export default init
