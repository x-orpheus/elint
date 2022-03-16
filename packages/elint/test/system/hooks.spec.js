'use strict'

/**
 * hooks 相关测试
 */

const path = require('path')
const fs = require('fs-extra')
const resetCacheProject = require('./utils/reset-cache-project')
const run = require('./utils/run')

let tmpDir
let hooksPath

beforeEach(async () => {
  tmpDir = await resetCacheProject()

  await run('git init', tmpDir)
  await run('git config user.name "zhang san"', tmpDir)
  await run('git config user.email "zhangsan@gmail.com"', tmpDir)

  /**
   * 这里需要手动安装一次，因为 husky 的 postinstall 检查是 ci 环境，不执行安装
   * 手动安装的时候，已经有了配置文件，配置文件 skipCI = false
   */
  await run('npm run hooks-install', tmpDir)

  hooksPath = path.join(tmpDir, '.git/hooks')
})

/**
 * install & uninstall git hooks
 */
test('hooks install && uninstall', async () => {
  let hooks

  await run('npm run hooks-uninstall', tmpDir)

  hooks = await fs.readdir(hooksPath)
  expect(hooks.filter(p => !p.includes('.sample')).length).toEqual(0)

  await run('npm run hooks-install', tmpDir)

  hooks = await fs.readdir(hooksPath)
  expect(hooks.filter(p => !p.includes('.sample')).length).not.toEqual(0)
})

/**
 * 不合法的 git commit message
 */
test('lint commtest(error)', async () => {
  await run('git add package.json', tmpDir)

  await expect(run('git commit -m "lint commtest(error)"', tmpDir)).toReject()
})

/**
 * 合法的 git commit message
 */
test('lint commtest(success)', async () => {
  await run('git add package.json', tmpDir)

  await expect(run('git commit -m "build: lint commtest(success)"', tmpDir)).toResolve()
})

/**
 * 在 git hooks 中执行 lint，lint 的文件符合规范
 */
test('lint stage files', async () => {
  // 添加符合规范的文件
  await run('git add src/standard1.css', tmpDir)

  // 强行修改 .huskyrc.js，commit 前执行 lint style
  const huskyFilePath = path.join(tmpDir, '.huskyrc.js')
  const huskyFileContent = `
    module.exports = {
      'hooks': {
        'commit-msg': 'elint lint style "src/**/*"'
      }
    }
  `

  await fs.writeFile(huskyFilePath, huskyFileContent)

  // 只校验 stage 文件，不报错
  await expect(run('git commit -m "build: lint stage files"', tmpDir)).toResolve()
})

/**
 * 在 git hooks 中执行 npm script，npm script 中执行 lint
 * lint 的文件符合规范
 */
test('lint stage files(deep)', async () => {
  // 添加符合规范的文件
  await run('git add src/standard2.css', tmpDir)

  // 强行修改 .huskyrc.js，commit 前执行 npm run lint-style-without-fix
  // 此时 elint 的父进程并非 husky，父进程的父进程才是，校验 is-git-hooks 方法是否正确
  const huskyFilePath = path.join(tmpDir, '.huskyrc.js')
  const huskyFileContent = `
    module.exports = {
      'hooks': {
        'commit-msg': 'npm run lint-style-without-fix'
      }
    }
  `

  await fs.writeFile(huskyFilePath, huskyFileContent)

  // 只校验 stage 文件，不报错
  await expect(run('git commit -m "build: lint stage files(deep)"', tmpDir)).toResolve()
})

/**
 * 在 git hooks 中执行 lint，lint 的文件不符合规范
 */
test('lint stage files(error)', async () => {
  // 添加所有 src 目录下的文件
  await run('git add src', tmpDir)

  // 强行修改 .huskyrc.js，commit 前执行 lint style
  const huskyFilePath = path.join(tmpDir, '.huskyrc.js')
  const huskyFileContent = `
    module.exports = {
      'hooks': {
        'commit-msg': 'elint lint style "src/**/*"'
      }
    }
  `

  await fs.writeFile(huskyFilePath, huskyFileContent)

  // 报错
  await expect(run('git commit -m "build: lint stage files(error)"', tmpDir)).toReject()
})

/**
 * 在 git hooks 中执行 lint + prettier，lint 的文件不符合规范
 */
test('lint stage files with prettier(error)', async () => {
  // 添加所有 src 目录下的文件
  await run('git add src', tmpDir)

  // 强行修改 .huskyrc.js，commit 前执行 lint style
  const huskyFilePath = path.join(tmpDir, '.huskyrc.js')
  const huskyFileContent = `
    module.exports = {
      'hooks': {
        'commit-msg': 'elint lint style "src/**/*" --prettier'
      }
    }
  `

  await fs.writeFile(huskyFilePath, huskyFileContent)

  // 报错
  await expect(run('git commit -m "build: lint stage files with prettier(error)"', tmpDir)).toReject()
})

test('lint stage files(fix)', async () => {
  // 添加所有 src 目录下的文件
  await run('git add src', tmpDir)

  // 强行修改 .huskyrc.js，commit 前执行 lint style
  const huskyFilePath = path.join(tmpDir, '.huskyrc.js')
  const huskyFileContent = `
    module.exports = {
      'hooks': {
        'commit-msg': 'elint lint style "src/**/*" --fix'
      }
    }
  `

  await fs.writeFile(huskyFilePath, huskyFileContent)

  // 报错，因为 fix 在 git hooks 中无效
  await expect(run('git commit -m "build: lint stage files(fix)"', tmpDir)).toReject()
})

test('lint stage files with prettier(fix)', async () => {
  // 添加所有 src 目录下的文件
  await run('git add src', tmpDir)

  // 强行修改 .huskyrc.js，commit 前执行 lint style
  const huskyFilePath = path.join(tmpDir, '.huskyrc.js')
  const huskyFileContent = `
    module.exports = {
      'hooks': {
        'commit-msg': 'elint lint style "src/**/*" --fix --prettier'
      }
    }
  `

  await fs.writeFile(huskyFilePath, huskyFileContent)

  // 报错，因为 fix 在 git hooks 中无效
  await expect(run('git commit -m "build: lint stage files with prettier(fix)"', tmpDir)).toReject()
})
