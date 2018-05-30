'use strict';

const path = require('path');
const fs = require('fs-extra');
const cwd = process.env.INIT_CWD;
const npmPackageName = process.env.npm_package_name;

// elint 开发过程中不执行
if (!cwd || npmPackageName === 'elint') {
  return;
}

const scriptPath = path.join(__dirname, '../scripts/postinstall');
const destDirPath = path.join(cwd, 'node_modules/.hooks');
const destScriptPath = path.join(destDirPath, 'postinstall');

// 确保目录存在
fs.ensureDirSync(destDirPath);

// 部署 scripts
fs.copySync(scriptPath, destScriptPath);

// 添加执行权限
fs.chmodSync(destScriptPath, 0o755);
