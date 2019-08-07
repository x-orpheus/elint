'use strict'

/**
 * hooks 相关测试
 */

const test = require('ava')
const path = require('path')
const fs = require('fs-extra')
const createTmpProjectFromCache = require('./utils/create-tmp-project-from-cache')
const run = require('./utils/run')

const appendFile = async filePath => {
  await fs.appendFile(filePath, '\n')
}

test.beforeEach(async t => {
  const tmpDir = await createTmpProjectFromCache()

  await run('git init', tmpDir)
  await run('git config user.name "zhang san"', tmpDir)
  await run('git config user.email "zhangsan@gmail.com"', tmpDir)

  /**
   * 这里需要手动安装一次，因为 husky 的 postinstall 检查是 ci 环境，不执行安装
   * 手动安装的时候，已经有了配置文件，配置文件 skipCI = false
   */
  await run('npm run hooks-install', tmpDir)

  const hooksPath = path.join(tmpDir, '.git/hooks')

  t.context = {
    tmpDir,
    hooksPath
  }
})

/**
 * install & uninstall git hooks
 */
test('hooks install && uninstall', async t => {
  const { tmpDir, hooksPath } = t.context
  let hooks

  await run('npm run hooks-uninstall', tmpDir)

  hooks = await fs.readdir(hooksPath)
  t.is(hooks.filter(p => !p.includes('.sample')).length, 0)

  await run('npm run hooks-install', tmpDir)

  hooks = await fs.readdir(hooksPath)
  t.not(hooks.filter(p => !p.includes('.sample')).length, 0)
})

/**
 * 不合法的 git commit message
 */
test('lint commtest(error)', async t => {
  const { tmpDir } = t.context

  await run('git add package.json', tmpDir)

  await t.throwsAsync(run('git commit -m "lint commtest(error)"', tmpDir))
})

/**
 * 合法的 git commit message
 */
test('lint commtest(success)', async t => {
  const { tmpDir } = t.context

  await run('git add package.json', tmpDir)

  await t.notThrowsAsync(run('git commit -m "build: lint commtest(success)"', tmpDir))
})

/**
 * 在 git hooks 中执行 lint，lint 的文件符合规范
 */
test('lint stage files', async t => {
  const { tmpDir } = t.context

  // 添加符合规范的文件
  await run('git add src/standard.css', tmpDir)

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
  await t.notThrowsAsync(run('git commit -m "build: lint stage files"', tmpDir))
})

/**
 * 在 git hooks 中执行 npm script，npm script 中执行 lint
 * lint 的文件符合规范
 */
test('lint stage files(deep)', async t => {
  const { tmpDir } = t.context

  // 添加符合规范的文件
  await run('git add src/standard.css', tmpDir)

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
  await t.notThrowsAsync(run('git commit -m "build: lint stage files(deep)"', tmpDir))
})

/**
 * 在 git hooks 中执行 lint，lint 的文件不符合规范
 */
test('lint stage files(error)', async t => {
  const { tmpDir } = t.context

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
  await t.throwsAsync(run('git commit -m "build: lint stage files(error)"', tmpDir))
})

/**
 * 在 git hooks 中执行 lint，lint 的文件符合规范
 * 在 git add file 后，再次修改了 file，修改成不符合规范的
 */
test('lint stage files from git', async t => {
  const { tmpDir } = t.context

  // 添加符合规范的文件
  await run('git add src/standard.css', tmpDir)

  // 然后修改的不符合规范了，但是不执行 git add
  // 此时 lint 应该直接从暂存区获取文件内容，不报错
  await appendFile(path.join(tmpDir, 'src/standard.css'))

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
  await t.notThrowsAsync(run('git commit -m "build: lint stage files from git"', tmpDir))
})

test('lint stage files(fix)', async t => {
  const { tmpDir } = t.context

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
  await t.throwsAsync(run('git commit -m "build: lint stage files(fix)"', tmpDir))
})

test('lint stage files(force-fix)', async t => {
  const { tmpDir } = t.context

  // 添加所有 src 目录下的文件
  await run('git add src', tmpDir)

  // 强行修改 .huskyrc.js，commit 前执行 lint style
  const huskyFilePath = path.join(tmpDir, '.huskyrc.js')
  const huskyFileContent = `
    module.exports = {
      'hooks': {
        'commit-msg': 'elint lint style "src/**/*" --force-fix'
      }
    }
  `

  await fs.writeFile(huskyFilePath, huskyFileContent)

  // 不报错，force-fix
  await t.notThrowsAsync(run('git commit -m "build: lint stage files(force-fix)"', tmpDir))
})
