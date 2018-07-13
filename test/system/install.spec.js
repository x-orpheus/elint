'use strict'

/**
 * 安装相关的测试
 */

const { test, beforeEach } = require('ava')
const path = require('path')
const fs = require('fs-extra')
const createTmpProject = require('./utils/create-tmp-project')
const run = require('./utils/run')
const { elintPkgPath, presetPkgPath } = require('./utils/variable')

function fileExists (context) {
  return Promise.all([
    fs.exists(context.elintrcPath),
    fs.exists(context.elintignorePath),
    fs.exists(context.stylelintrcPath),
    fs.exists(context.stylelintignorePath),
    fs.exists(context.huskyrcPath),
    fs.exists(context.commitlintrcPath)
  ]).then(result => {
    return result.every(item => item)
  })
}

function checkDep (tmpDir) {
  const pkgPath = path.join(tmpDir, 'package.json')
  // eslint-disable-next-line global-require
  const pkg = require(pkgPath)
  const deps = Object.keys(pkg.devDependencies)

  // elint-preset-standard devDependencies
  return [
    'eslint-config-standard',
    'eslint-plugin-import',
    'eslint-plugin-node',
    'eslint-plugin-promise',
    'eslint-plugin-standard',
    'stylelint-config-standard'
  ].every(item => deps.includes(item))
}

beforeEach(function * (t) {
  const tmpDir = yield createTmpProject()

  const elintrcPath = path.join(tmpDir, '.eslintrc.js')
  const elintignorePath = path.join(tmpDir, '.eslintignore')
  const stylelintrcPath = path.join(tmpDir, '.stylelintrc.js')
  const stylelintignorePath = path.join(tmpDir, '.stylelintignore')
  const huskyrcPath = path.join(tmpDir, '.huskyrc.js')
  const commitlintrcPath = path.join(tmpDir, '.commitlintrc.js')

  t.context = {
    tmpDir,
    elintrcPath,
    elintignorePath,
    stylelintrcPath,
    stylelintignorePath,
    huskyrcPath,
    commitlintrcPath
  }
})

test('先安装 elint，再安装 preset', function * (t) {
  const tmpDir = t.context.tmpDir

  yield run(`npm install ${elintPkgPath}`, tmpDir)
  yield run(`npm install ${presetPkgPath}`, tmpDir)

  return fileExists(t.context).then(result => {
    t.truthy(result)
  })
})

test('先安装 preset，再安装 elint', function * (t) {
  const tmpDir = t.context.tmpDir

  yield run(`npm install ${presetPkgPath}`, tmpDir)
  yield run(`npm install ${elintPkgPath}`, tmpDir)

  return fileExists(t.context).then(result => {
    t.truthy(result)
  })
})

test('同时安装', function * (t) {
  const tmpDir = t.context.tmpDir

  yield run(`npm install ${presetPkgPath} ${elintPkgPath}`, tmpDir)

  return fileExists(t.context).then(result => {
    t.truthy(result)
  })
})

test('先安装 elint，然后使用 elint 安装 preset', function * (t) {
  const {
    tmpDir,
    elintrcPath,
    stylelintrcPath
  } = t.context

  yield run(`npm install ${elintPkgPath}`, tmpDir)

  // 这里使用 npm 上的包进行测试：elint-preset-standard
  yield run(`node node_modules${path.sep}.bin${path.sep}elint install standard`, tmpDir)

  t.truthy(fs.exists(elintrcPath))
  t.truthy(fs.exists(stylelintrcPath))

  t.truthy(checkDep(tmpDir))
})

test('先安装 elint，然后使用 elint 安装 preset，指定 registry', function * (t) {
  const {
    tmpDir,
    elintrcPath,
    stylelintrcPath
  } = t.context

  const alias = process.env.CI ? 'skimdb' : 'taobao'

  yield run(`npm install ${elintPkgPath}`, tmpDir)

  // 这里使用 npm 上的包进行测试：elint-preset-standard
  // eslint-disable-next-line max-len
  yield run(`node node_modules${path.sep}.bin${path.sep}elint install standard --registry ${alias}`, tmpDir)

  t.truthy(fs.exists(elintrcPath))
  t.truthy(fs.exists(stylelintrcPath))

  t.truthy(checkDep(tmpDir))
})
