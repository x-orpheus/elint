/**
 * 执行一些准备工作
 */
import os from 'node:os'
import { startUpLocalRegistry } from './utils/local-registry.js'
import createCacheProject from './utils/create-cache-project.js'

const init = async () => {
  // 输出 CPU 和内存信息
  console.log('=== OS Info ===')
  console.log(`CPU count: ${os.cpus().length}`)
  console.log(`Memory: ${Math.ceil(os.totalmem() / 1024 / 1024 / 1024)}G`)
  console.log()

  await startUpLocalRegistry()

  // 创建缓存项目
  await createCacheProject()
}

export default init
