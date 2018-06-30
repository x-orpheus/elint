'use strict';

const os = require('os');
const path = require('path');
const fs = require('fs-extra');
const execa = require('execa');
const { version } = require('../../package.json');

// 创建测试项目
function createTempProject() {
  const testNo = Math.random().toString().substr(2);
  const tempDir = path.join(os.tmpdir(), `elint_test_system_${testNo}`);
  const testProjectDir = path.join(__dirname, 'test-project');

  // 创建测试项目
  return fs.copy(testProjectDir, tempDir).then(() => {
    return tempDir;
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

// 一些固定不变的路径
const elintPath = path.join(__dirname, '../../');
const elintPkgPath = path.join(elintPath, `elint-${version}.tgz`);

const presetPath = path.join(__dirname, 'test-preset');
const presetPkgPath = path.join(presetPath, 'elint-preset-system-test-1.0.0.tgz');

module.exports = {
  createTempProject,
  run,
  npmCheck,
  elintPath,
  elintPkgPath,
  presetPath,
  presetPkgPath
};
