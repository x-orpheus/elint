'use strict';

/**
 * 功能测试
 */

const { test, beforeEach } = require('ava');
const path = require('path');
const fs = require('fs-extra');
const { createTmpProjectFromCache, run } = require('./utils');

beforeEach(function* (t) {
  const tmpDir = yield createTmpProjectFromCache();
  t.context.tmpDir = tmpDir;
});

test('lint', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.throws(run('npm run lint-without-fix', tmpDir));
});

test('lint --fix', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.notThrows(run('npm run lint-fix', tmpDir));
});

test('lint --no-ignore', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.throws(run('npm run lint-no-ignore', tmpDir));
});

test('lint es', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.throws(run('npm run lint-es-without-fix', tmpDir));
});

test('lint es with ignore', function* (t) {
  const tmpDir = t.context.tmpDir;

  // 忽略有问题的文件
  const eslintignorePath = path.join(tmpDir, '.eslintignore');
  yield fs.appendFile(eslintignorePath, '**/src/index.js');

  yield t.notThrows(run('npm run lint-es-without-fix', tmpDir));
});

test('lint es --fix', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.notThrows(run('npm run lint-es-fix', tmpDir));
});

test('lint style', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.throws(run('npm run lint-style-without-fix', tmpDir));
});

test('lint style with ignore', function* (t) {
  const tmpDir = t.context.tmpDir;

  // 忽略有问题的文件
  const stylelintignorePath = path.join(tmpDir, '.stylelintignore');
  yield fs.appendFile(stylelintignorePath, '**/src/index.css');

  return t.notThrows(run('npm run lint-style-without-fix', tmpDir));
});

test('lint style --fix', function* (t) {
  const tmpDir = t.context.tmpDir;

  yield t.notThrows(run('npm run lint-style-fix', tmpDir));
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
