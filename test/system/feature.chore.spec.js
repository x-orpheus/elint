'use strict';

/**
 * 杂项测试
 */

const { test, beforeEach } = require('ava');
const path = require('path');
const fs = require('fs-extra');
const createTmpProjectFromCache = require('./utils/create-tmp-project-from-cache');
const run = require('./utils/run');

beforeEach(function* (t) {
  const tmpDir = yield createTmpProjectFromCache();
  t.context.tmpDir = tmpDir;
});

test('version', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.notThrows(run('npm run version', tmpDir));
});

test('diff 存在差异文件', function* (t) {
  const tmpDir = t.context.tmpDir;

  const elintrcPath = path.join(tmpDir, '.eslintrc.js');
  const elintrcOldPath = path.join(tmpDir, '.eslintrc.old.js');

  yield fs.copy(elintrcPath, elintrcOldPath);
  yield fs.appendFile(elintrcOldPath, 'console.log(1)');

  yield t.notThrows(run('npm run diff', tmpDir));
});

test('diff 不存在差异文件', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.notThrows(run('npm run diff', tmpDir));
});

test('直接执行 elint，显示 help', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.notThrows(run(`node node_modules${path.sep}.bin${path.sep}elint`, tmpDir));
});
