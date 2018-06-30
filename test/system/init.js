'use strict';

/**
 * 执行一些准备工作
 */

const os = require('os');
const {
  run,
  npmCheck,
  elintPath,
  presetPath
} = require('./utils');

// 输出 CPU 和内存信息
console.log('=== OS Info ===');
console.log(`CPU: ${os.cpus().length}`);
console.log(`Memory: ${Math.ceil(os.totalmem() / 1024 / 1024 / 1024)}G`)

// 同步执行 elint 打包
run('npm pack', elintPath, true);

// 同步执行 preset 打包
run('npm pack', presetPath, true);

// 仅用于 ci，如果 npm 在 5.4 至 5.6 之间，升级 npm
if (process.env.CI) {
  npmCheck();
}
