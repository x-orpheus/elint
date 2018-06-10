'use strict';

const fs = require('fs-extra');
const path = require('path');
const execa = require('execa');
const { getBaseDir } = require('../../src/env');
const execaPath = require.resolve('execa');
const isGitHooksPath = require.resolve('../../src/utils/is-git-hooks.js');

/**
 * 模拟 husky 环境执行 is-git-hooks 测试
 *
 * @returns {Promise} promise
 */
function run() {
  const baseDir = getBaseDir();

  // 文件路径
  const execFilePath = path.join(baseDir, 'file.js');
  const huskyFilePath = path.join(baseDir, 'node_modules/husky/index.js');

  // 创建文件
  fs.outputFileSync(execFilePath, `
    const isGitHooks = require('${isGitHooksPath}');
    isGitHooks().then(result => {
      process.stdout.write(JSON.stringify(result));
    });
  `);

  // 创建 husky 环境并添加执行权限
  fs.outputFileSync(huskyFilePath, `
    const execa = require('${execaPath}');
    execa('node', ['${execFilePath}']).then(result => {
      process.stdout.write(JSON.stringify(result.stdout));
    });
  `);
  fs.chmodSync(huskyFilePath, 0o755);

  return execa('node', [huskyFilePath])
    .then(result => result.stdout);
}

module.exports = run;
