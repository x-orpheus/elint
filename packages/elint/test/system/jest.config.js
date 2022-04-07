// jest 的 globalSetup 和 globalTeardown 不支持 moduleNameMapper
// 引入带有 .js 的 ts 文件，会提示找不到文件，不带 .js 后缀会让 esm 模式下正常的用例找不到对应的 ts 文件
export default {
  bail: false,
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  setupFilesAfterEnv: ['jest-extended/all'],
  testTimeout: 5 * 60 * 1000,
  testMatch: ['**/test/system/**/*.spec.js']
}
