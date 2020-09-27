'use strict'

/**
 * 执行一些准备工作
 */

const os = require('os')
const run = require('./run')
const createCacheProject = require('./create-cache-project')
const { elintPath, presetPath } = require('./variable')
const hasYarn = require('./has-yarn')

// 输出 CPU 和内存信息
console.log('=== OS Info ===')
console.log(`CPU count: ${os.cpus().length}`)
console.log(`Memory: ${Math.ceil(os.totalmem() / 1024 / 1024 / 1024)}G`)
console.log()

// 同步执行 elint 打包
run('npm pack', elintPath, true)

// 同步执行 preset 打包
run('npm pack', presetPath, true)

// 创建缓存项目
createCacheProject()

if (hasYarn()) {
  createCacheProject(true)
}
