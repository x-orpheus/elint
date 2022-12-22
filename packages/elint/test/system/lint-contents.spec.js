/**
 * lint 测试：主要测试 git commit 时，直接读取 staged files 的情况
 */

import { join } from 'path'
import fs from 'fs-extra'
import resetCacheProject from './utils/reset-cache-project.js'
import run from './utils/run.js'
import initHusky from './utils/init-husky.js'

let tmpDir

beforeEach(async () => {
  tmpDir = await resetCacheProject()

  await run('git init', tmpDir)
  await run('git config user.name "zhang san"', tmpDir)
  await run('git config user.email "zhangsan@gmail.com"', tmpDir)
  await run('git config core.autocrlf false', tmpDir)
  await run('git commit --allow-empty -m "build: initial empty commit"', tmpDir)

  await run('npm run hooks-install', tmpDir)
})

afterEach(async () => {
  await run('npm run hooks-uninstall', tmpDir)
})

test('git add 符合规范的文件后，修改为不符合，commit 成功', async () => {
  // 添加符合规范的文件
  await run('git add src/standard1.css', tmpDir)

  // 然后修改的不符合规范了，但是不执行 git add
  // 此时 lint 应该直接从暂存区获取文件内容，不报错
  await fs.writeFile(
    join(tmpDir, 'src/standard1.css'),
    '.div {\n  height: 0.11111rem;\n}\n'
  )

  // init husky
  await initHusky('npm run elint lint "src/**/*"', tmpDir)

  // 只校验 stage 文件，不报错
  await expect(run('git commit -m "build: success"', tmpDir)).toResolve()
})

test('git add 符合规范的文件后，修改为不符合，commit 成功（多文件）', async () => {
  // 添加符合规范的文件
  await run('git add src/standard1.css', tmpDir)
  await run('git add src/standard2.css', tmpDir)

  // 然后修改的不符合规范了，但是不执行 git add
  // 此时 lint 应该直接从暂存区获取文件内容，不报错
  await fs.writeFile(
    join(tmpDir, 'src/standard1.css'),
    '.div {\n  height: 0.11111rem;\n}\n'
  )

  // init husky
  await initHusky('npm run elint lint "src/**/*"', tmpDir)

  // 只校验 stage 文件，不报错
  await expect(run('git commit -m "build: success"', tmpDir)).toResolve()
})

test('git add 不符合规范的文件后，修改为符合规范的，commit 不成功', async () => {
  // 添加不符合规范的文件
  await run('git add src/index.js', tmpDir)

  // 然后修改的符合规范了，但是不执行 git add
  // 此时 lint 应该直接从暂存区获取文件内容，报错
  await fs.writeFile(join(tmpDir, 'src/index.js'), 'const a = 1')

  // init husky
  await initHusky('npm run elint lint "src/**/*"', tmpDir)

  await expect(run('git commit -m "build: fail"', tmpDir)).toReject()
})

test('git add 不符合规范的文件后，修改为符合规范的，commit 不成功（多文件）', async () => {
  // 添加不符合规范的文件
  await run('git add src/index.js', tmpDir)
  await run('git add src/standard.js', tmpDir)

  // 然后修改的符合规范了，但是不执行 git add
  // 此时 lint 应该直接从暂存区获取文件内容，报错
  await fs.writeFile(join(tmpDir, 'src/index.js'), 'const a = 1')

  // init husky
  await initHusky('npm run elint lint "src/**/*"', tmpDir)

  await expect(run('git commit -m "build: fail"', tmpDir)).toReject()
})
