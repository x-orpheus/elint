'use strict'

/**
 * lint 测试：主要测试 git commit 时，直接读取 staged files 的情况
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
 * 在 git hooks 中执行 lint，lint 的文件符合规范
 * 在 git add file 后，再次修改了 file，修改成不符合规范的
 */
test('文件 git add 后，再次修改，测试 commit 时的校验', async t => {
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
