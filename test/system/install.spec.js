'use strict';

/**
 * 安装相关的测试
 */

const { test, beforeEach, afterEach } = require('ava');
const path = require('path');
const fs = require('fs-extra');
const { createTempProject, run, elintPkgPath, presetPkgPath } = require('./utils');

function fileExists(context) {
  return Promise.all([
    fs.exists(context.elintrcPath),
    fs.exists(context.elintignorePath),
    fs.exists(context.stylelintrcPath),
    fs.exists(context.stylelintignorePath),
    fs.exists(context.huskyrcPath),
    fs.exists(context.commitlintrcPath)
  ]).then(result => {
    return result.every(item => item);
  });
}

beforeEach(function* (t) {
  const tempDir = yield createTempProject();

  const elintrcPath = path.join(tempDir, '.eslintrc.js');
  const elintignorePath = path.join(tempDir, '.eslintignore');
  const stylelintrcPath = path.join(tempDir, '.stylelintrc.js');
  const stylelintignorePath = path.join(tempDir, '.stylelintignore');
  const huskyrcPath = path.join(tempDir, '.huskyrc.js');
  const commitlintrcPath = path.join(tempDir, '.commitlintrc.js');

  t.context = {
    tempDir,
    elintrcPath,
    elintignorePath,
    stylelintrcPath,
    stylelintignorePath,
    huskyrcPath,
    commitlintrcPath
  };
});

afterEach(t => {
  const tempDir = t.context.tempDir;

  // 清理
  return fs.remove(tempDir);
});

test('先安装 elint，再安装 preset', function* (t) {
  const tempDir = t.context.tempDir;

  yield run(`npm install ${elintPkgPath}`, tempDir);
  yield run(`npm install ${presetPkgPath}`, tempDir);

  return fileExists(t.context).then(result => {
    t.truthy(result);
  });
});

test('先安装 preset，再安装 elint', function* (t) {
  const tempDir = t.context.tempDir;

  yield run(`npm install ${presetPkgPath}`, tempDir);
  yield run(`npm install ${elintPkgPath}`, tempDir);

  return fileExists(t.context).then(result => {
    t.truthy(result);
  });
});

test('同时安装', function* (t) {
  const tempDir = t.context.tempDir;

  yield run(`npm install ${presetPkgPath} ${elintPkgPath}`, tempDir);

  return fileExists(t.context).then(result => {
    t.truthy(result);
  });
});

test('先安装 elint，然后使用 elint 安装 preset', function* (t) {
  const {
    tempDir,
    elintrcPath,
    stylelintrcPath,
    huskyrcPath,
    commitlintrcPath
  } = t.context;

  // 这里使用 npm 上的包进行测试
  yield run(`npm install ${elintPkgPath}`, tempDir);
  yield run(`node node_modules${path.sep}.bin${path.sep}elint install test`, tempDir);

  t.truthy(fs.exists(elintrcPath));
  t.truthy(fs.exists(stylelintrcPath));
  t.truthy(fs.exists(huskyrcPath));
  t.truthy(fs.exists(commitlintrcPath));
});
