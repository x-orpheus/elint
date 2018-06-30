'use strict';

/**
 * 功能测试
 */

const { test, beforeEach, afterEach } = require('ava');
const path = require('path');
const fs = require('fs-extra');
const { createTempProject, run, elintPkgPath, presetPkgPath } = require('./utils');

beforeEach(function* (t) {
  const tempDir = yield createTempProject();

  yield run(`npm install ${presetPkgPath} ${elintPkgPath}`, tempDir);

  t.context.tempDir = tempDir;
});

afterEach(t => {
  const tempDir = t.context.tempDir;

  // 清理
  return fs.remove(tempDir);
});

test('lint', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.throws(run('npm run lint-without-fix', tempDir));
});

test('lint --fix', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.notThrows(run('npm run lint-fix', tempDir));
});

test('lint --no-ignore', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.throws(run('npm run lint-no-ignore', tempDir));
});

test('lint es', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.throws(run('npm run lint-es-without-fix', tempDir));
});

test('lint es with ignore', function* (t) {
  const tempDir = t.context.tempDir;

  // 忽略有问题的文件
  const eslintignorePath = path.join(tempDir, '.eslintignore');
  yield fs.appendFile(eslintignorePath, '**/src/index.js');

  yield t.notThrows(run('npm run lint-es-without-fix', tempDir));
});

test('lint es --fix', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.notThrows(run('npm run lint-es-fix', tempDir));
});

test('lint style', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.throws(run('npm run lint-style-without-fix', tempDir));
});

test('lint style with ignore', function* (t) {
  const tempDir = t.context.tempDir;

  // 忽略有问题的文件
  const stylelintignorePath = path.join(tempDir, '.stylelintignore');
  yield fs.appendFile(stylelintignorePath, '**/src/index.css');

  return t.notThrows(run('npm run lint-style-without-fix', tempDir));
});

test('lint style --fix', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.notThrows(run('npm run lint-style-fix', tempDir));
});

test('version', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.notThrows(run('npm run version', tempDir));
});

test('diff 存在差异文件', function* (t) {
  const tempDir = t.context.tempDir;

  const elintrcPath = path.join(tempDir, '.eslintrc.js');
  const elintrcOldPath = path.join(tempDir, '.eslintrc.old.js');

  yield fs.copy(elintrcPath, elintrcOldPath);
  yield fs.appendFile(elintrcOldPath, 'console.log(1)');

  yield t.notThrows(run('npm run diff', tempDir));
});

test('diff 不存在差异文件', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.notThrows(run('npm run diff', tempDir));
});

test('直接执行 elint，显示 help', function* (t) {
  const tempDir = t.context.tempDir;

  yield t.notThrows(run(`node node_modules${path.sep}.bin${path.sep}elint`, tempDir));
});
