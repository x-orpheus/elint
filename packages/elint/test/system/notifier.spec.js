// /**
//  * 更新检查测试
//  *
//  * 使用 elint-preset-test 测试更新检查功能
//  * v1.2.0 开始，package.json 加入 elint 配置：
//  *
//  *  v1.2.0
//  *  v1.2.1
//  *  v1.3.0
//  *  v2.0.0
//  */

// import resetCacheProject from './utils/reset-cache-project.js'
// import run from './utils/run.js'
// import { elintPkgPath } from './utils/variable.js'

// let tmpDir

// /**
//  * 无需每次都 reset
//  */
// beforeAll(async () => {
//   tmpDir = await resetCacheProject()
// })

// test('安装 latest，没有更新提示', async () => {
//   await run(`npm install --silent ${elintPkgPath}`, tmpDir)
//   await run('npm install --silent elint-preset-test@latest', tmpDir)

//   // 不显示更新提示
//   await expect(run('npm run lint-fix', tmpDir, false)).toResolve()
// })

// test('安装 5.0.0，有更新提示', async () => {
//   await run(`npm install --silent ${elintPkgPath}`, tmpDir)
//   await run('npm install --silent elint-preset-test@5.0.0', tmpDir)

//   // 显示更新提示
//   await expect(run('npm run lint-fix', tmpDir, false)).toResolve()
// })
