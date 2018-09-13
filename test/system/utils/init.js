'use strict'

/**
 * 执行一些准备工作
 */

const os = require('os')
const run = require('./run')
const execa = require('execa')
const createCacheProject = require('./create-cache-project')
const { elintPath, presetPath } = require('./variable')
const npmVersions = require('../../../src/utils/check-npm-version')

// 输出 CPU 和内存信息
console.log('=== OS Info ===')
console.log(`CPU count: ${os.cpus().length}`)
console.log(`Memory: ${Math.ceil(os.totalmem() / 1024 / 1024 / 1024)}G`)
console.log()

// 同步执行 elint 打包
run('npm pack', elintPath, true)

// 同步执行 preset 打包
run('npm pack', presetPath, true)

// 仅用于 ci，检测 npm 版本
if (process.env.CI && !npmVersions.pass) {
  console.log()
  console.log('升级 npm')
  console.log()

  if (process.platform === 'win32') {
    execa.sync('npm', ['install', 'npm', '-g'])
  } else {
    execa.sync('sudo', ['npm', 'install', 'npm', '-g'])
  }
}

// 创建缓存项目
createCacheProject()
