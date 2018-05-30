'use strict';

const path = require('path');
const fs = require('fs-extra');
const tryRequire = require('./utils/try-require');
const { nodeModulesDir } = require('./env');
const { install } = require('./index');
const pwd = process.env.PWD;

// 开发过程中不执行
if (!pwd.includes('node_modules')) {
  return;
}

const scriptPath = path.join(__dirname, '../scripts/postinstall');
const destDirPath = path.join(nodeModulesDir, '.hooks');
const destScriptPath = path.join(destDirPath, 'postinstall');

// 确保目录存在
fs.ensureDirSync(destDirPath);

// 部署 scripts
fs.copySync(scriptPath, destScriptPath);

// 添加执行权限
fs.chmodSync(destScriptPath, 0o755);

// 安装完成执行一次 install
const presetName = tryRequire(/elint-preset-/)[0];

if (!presetName) {
  return;
}

install(presetName);
