'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const { version } = require('../../package.json');

const cacheDir = path.join(os.tmpdir(), 'elint_test_system', 'cache');
const testProjectDir = path.join(__dirname, 'test-project');
// elint
const elintPath = path.join(__dirname, '../../');
const elintPkgPath = path.join(elintPath, `elint-${version}.tgz`);
// preset
const presetPath = path.join(__dirname, 'test-preset');
const presetPkgPath = path.join(presetPath, 'elint-preset-system-test-1.0.0.tgz');

function getTmpDir() {
  const testNo = Math.random().toString().substr(2);
  const tmpDir = path.join(os.tmpdir(), 'elint_test_system', testNo);

  return tmpDir;
}

// 创建空的测试项目：主要用于"安装"测试
function createTmpProject() {
  const tmpDir = getTmpDir();

  // 创建测试项目
  return fs.copy(testProjectDir, tmpDir).then(() => {
    return tmpDir;
  });
}

// 创建缓存项目：方便后面重复使用
function createCacheProject() {
  if (fs.existsSync(cacheDir)) {
    fs.emptyDirSync(cacheDir);
  }

  // 创建缓存项目
  fs.copySync(testProjectDir, cacheDir);

  // 安装依赖
  run(`npm install ${presetPkgPath} ${elintPkgPath}`, cacheDir, true);
}

// 从缓存创建测试项目：依赖已经安装好，主要用于"功能"测试
function createTmpProjectFromCache() {
  const tmpDir = getTmpDir();

  return fs.copy(cacheDir, tmpDir).then(() => {
    return tmpDir;
  });
}

// 执行命令
function run(command, cwd, sync = false) {
  const strs = command.match(/(?:[^\s"]+|"[^"]*")+/g);
  const method = sync ? execa.sync : execa;

  let program = strs[0];
  const argus = strs.slice(1).map(s => {
    if (/^".+"$/.test(s)) {
      return s.slice(1, -1);
    }

    return s;
  });

  if (process.platform === 'win32' && program === 'node') {
    program = 'cmd';
    argus.unshift('/d /s /c');
  }

  const env = Object.assign({}, process.env, {
    INIT_CWD: cwd
  });

  console.log(`run: ${program} ${argus.join(' ')}, in ${cwd}`);
  return method(program, argus, {
    stdio: 'inherit',
    cwd,
    env
  });
}

// 检测 npm 版本，按需升级
function npmCheck() {
  const version = execa.sync('npm', ['-v']).stdout;
  const versions = version.split('.');

  if (versions[0] !== '5' || !['4', '5', '6'].includes(versions[1])) {
    return;
  }

  console.log('升级 npm');

  if (process.platform === 'win32') {
    execa.sync('npm', ['install', 'npm', '-g']);
  } else {
    execa.sync('sudo', ['npm', 'install', 'npm', '-g']);
  }
}

module.exports = {
  createTmpProject,
  createCacheProject,
  createTmpProjectFromCache,
  run,
  npmCheck,
  elintPath,
  elintPkgPath,
  presetPath,
  presetPkgPath
};
