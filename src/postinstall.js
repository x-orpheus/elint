'use strict';

const cwd = process.cwd();

// 开发过程中不执行
if (!cwd.includes('node_modules')) {
  return;
}

const path = require('path');
const fs = require('fs-extra');
const { getNodeModulesDir } = require('./env');
const { installFromScripts } = require('./index');

const nodeModulesDir = getNodeModulesDir();
const scriptPath = path.join(__dirname, '../scripts/postinstall');
const destDirPath = path.join(nodeModulesDir, '.hooks');
const destScriptPath = path.join(destDirPath, 'postinstall');

// 确保目录存在
fs.ensureDirSync(destDirPath);

// 部署 scripts
fs.copySync(scriptPath, destScriptPath);

// 兼容 windows
if (process.platform === 'win32') {
  const cmdScriptPath = path.join(__dirname, '../scripts/postinstall.cmd');
  const destCmdScriptPath = path.join(destDirPath, 'postinstall.cmd');

  fs.copySync(cmdScriptPath, destCmdScriptPath);
}

// 添加执行权限
fs.chmodSync(destScriptPath, 0o755);

// 安装完成执行一次 install
installFromScripts();
