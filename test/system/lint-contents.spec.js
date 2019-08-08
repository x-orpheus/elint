'use strict'

/**
 * lint 测试：主要测试 git commit 时，直接读取 staged files 的情况
 */

const test = require('ava')
const path = require('path')
const fs = require('fs-extra')
const createTmpProjectFromCache = require('./utils/create-tmp-project-from-cache')
const run = require('./utils/run')

const writeFile = (filePath, content) => fs.writeFile(filePath, content)
const initHusky = (command, tmpDir) => {
  // 强行修改 .huskyrc.js，commit 前执行 lint style
  const huskyFilePath = path.join(tmpDir, '.huskyrc.js')
  const huskyFileContent = `
    module.exports = {
      'hooks': {
        'commit-msg': '${command}'
      }
    }
  `

  return fs.writeFile(huskyFilePath, huskyFileContent)
}

test.beforeEach(async t => {
  const tmpDir = await createTmpProjectFromCache()

  await run('git init', tmpDir)
  await run('git config user.name "zhang san"', tmpDir)
  await run('git config user.email "zhangsan@gmail.com"', tmpDir)
  await run('git config core.autocrlf false', tmpDir)

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

test('git add 符合规范的文件后，修改为不符合，commit 成功', async t => {
  const { tmpDir } = t.context

  // 添加符合规范的文件
  await run('git add src/standard1.css', tmpDir)

  // 然后修改的不符合规范了，但是不执行 git add
  // 此时 lint 应该直接从暂存区获取文件内容，不报错
  await writeFile(path.join(tmpDir, 'src/standard1.css'), '.div {\n  height: 0.11111rem;\n}\n')

  // init husky
  await initHusky('elint lint style "src/**/*"', tmpDir)

  // 只校验 stage 文件，不报错
  await t.notThrowsAsync(run('git commit -m "build: success"', tmpDir))
})

test('git add 符合规范的文件后，修改为不符合，commit 成功（多文件）', async t => {
  const { tmpDir } = t.context

  // 添加符合规范的文件
  await run('git add src/standard1.css', tmpDir)
  await run('git add src/standard2.css', tmpDir)

  // 然后修改的不符合规范了，但是不执行 git add
  // 此时 lint 应该直接从暂存区获取文件内容，不报错
  await writeFile(path.join(tmpDir, 'src/standard1.css'), '.div {\n  height: 0.11111rem;\n}\n')

  // init husky
  await initHusky('elint lint style "src/**/*"', tmpDir)

  // 只校验 stage 文件，不报错
  await t.notThrowsAsync(run('git commit -m "build: success"', tmpDir))
})

test('git add 不符合规范的文件后，修改为符合规范的，commit 不成功', async t => {
  const { tmpDir } = t.context

  // 添加不符合规范的文件
  await run('git add src/index.js', tmpDir)

  // 然后修改的符合规范了，但是不执行 git add
  // 此时 lint 应该直接从暂存区获取文件内容，报错
  await writeFile(path.join(tmpDir, 'src/index.js'), 'const a = 1')

  // init husky
  await initHusky('elint lint es "src/**/*"', tmpDir)

  // 只校验 stage 文件，不报错
  await t.throwsAsync(run('git commit -m "build: fail"', tmpDir))
})

test('git add 不符合规范的文件后，修改为符合规范的，commit 不成功（多文件）', async t => {
  const { tmpDir } = t.context

  // 添加不符合规范的文件
  await run('git add src/index.js', tmpDir)
  await run('git add src/standard.js', tmpDir)

  // 然后修改的符合规范了，但是不执行 git add
  // 此时 lint 应该直接从暂存区获取文件内容，报错
  await writeFile(path.join(tmpDir, 'src/index.js'), 'const a = 1')

  // init husky
  await initHusky('elint lint es "src/**/*"', tmpDir)

  // 只校验 stage 文件，不报错
  await t.throwsAsync(run('git commit -m "build: fail"', tmpDir))
})
