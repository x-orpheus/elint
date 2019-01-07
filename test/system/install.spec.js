'use strict'

/**
 * 安装相关的测试
 */

const test = require('ava')
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

function checkDepend (tmpDir) {
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

test.beforeEach(async t => {
  const tmpDir = await createTmpProject()

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

test('先安装 elint，再安装 preset', async t => {
  const tmpDir = t.context.tmpDir

  await run(`npm install ${elintPkgPath}`, tmpDir)
  await run(`npm install ${presetPkgPath}`, tmpDir)

  return fileExists(t.context).then(result => {
    t.truthy(result)
  })
})

test('先安装 preset，再安装 elint', async t => {
  const tmpDir = t.context.tmpDir

  await run(`npm install ${presetPkgPath}`, tmpDir)
  await run(`npm install ${elintPkgPath}`, tmpDir)

  return fileExists(t.context).then(result => {
    t.truthy(result)
  })
})

test('同时安装', async t => {
  const tmpDir = t.context.tmpDir

  await run(`npm install ${presetPkgPath} ${elintPkgPath}`, tmpDir)

  return fileExists(t.context).then(result => {
    t.truthy(result)
  })
})

test('先安装 elint，然后使用 elint 安装 preset', async t => {
  const {
    tmpDir,
    elintrcPath,
    stylelintrcPath
  } = t.context

  await run(`npm install ${elintPkgPath}`, tmpDir)

  // 这里使用 npm 上的包进行测试：elint-preset-standard
  await run(`node node_modules${path.sep}.bin${path.sep}elint install standard`, tmpDir)

  t.truthy(fs.existsSync(elintrcPath))
  t.truthy(fs.existsSync(stylelintrcPath))

  t.truthy(checkDepend(tmpDir))
})

test('先安装 elint，然后使用 elint 安装 preset，指定 registry', async t => {
  const {
    tmpDir,
    elintrcPath,
    stylelintrcPath
  } = t.context

  const alias = process.env.CI ? 'skimdb' : 'taobao'

  await run(`npm install ${elintPkgPath}`, tmpDir)

  // 这里使用 npm 上的包进行测试：elint-preset-standard
  // eslint-disable-next-line max-len
  await run(`node node_modules${path.sep}.bin${path.sep}elint install standard --registry ${alias}`, tmpDir)

  t.truthy(fs.existsSync(elintrcPath))
  t.truthy(fs.existsSync(stylelintrcPath))

  t.truthy(checkDepend(tmpDir))
})
