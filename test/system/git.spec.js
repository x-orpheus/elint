'use strict';

/**
 * git 相关测试
 */

const { test, beforeEach, afterEach } = require('ava');
const path = require('path');
const fs = require('fs-extra');
const { createTempProject, run, elintPkgPath, presetPkgPath } = require('./utils');

beforeEach(function* (t) {
  const tempDir = yield createTempProject();
  const hooksPath = path.join(tempDir, '.git/hooks');

  t.context = {
    tempDir,
    hooksPath
  };

  yield run('git init', tempDir);
  yield run('git config user.name "zhang san"', tempDir);
  yield run('git config user.email "zhangsan@gmail.com"', tempDir);
  yield run(`npm install ${presetPkgPath} ${elintPkgPath}`, tempDir);
});

afterEach(function* (t) {
  const tempDir = t.context.tempDir;

  // 清理
  return fs.remove(tempDir);
});

test('hooks install && uninstall', function* (t) {
  const { tempDir, hooksPath } = t.context;
  let hooks;

  yield run('npm run hooks-uninstall', tempDir);

  hooks = yield fs.readdir(hooksPath);
  t.is(hooks.filter(p => !p.includes('.sample')).length, 0);

  yield run('npm run hooks-install', tempDir);

  hooks = yield fs.readdir(hooksPath);
  t.not(hooks.filter(p => !p.includes('.sample')).length, 0);
});

test('lint commtest(error)', function* (t) {
  const { tempDir } = t.context;

  /**
   * 这里需要手动安装一次，因为 husky 的 postinstall 检查是 ci 环境，不执行安装
   * 手动安装的时候，已经有了配置文件，配置文件 skipCI = false
   */
  yield run('npm run hooks-install', tempDir);
  yield run('git add package.json', tempDir);

  yield t.throws(run('git commit -m "hello"', tempDir));
});

test('lint commtest(success)', function* (t) {
  const { tempDir } = t.context;

  /**
   * 这里需要手动安装一次，因为 husky 的 postinstall 检查是 ci 环境，不执行安装
   * 手动安装的时候，已经有了配置文件，配置文件 skipCI = false
   */
  yield run('npm run hooks-install', tempDir);
  yield run('git add package.json', tempDir);

  yield t.notThrows(run('git commit -m "build: hello"', tempDir));
});
