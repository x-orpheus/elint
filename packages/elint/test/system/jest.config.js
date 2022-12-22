// jest 的 globalSetup 和 globalTeardown 不执行 moduleNameMapper
// 导致引入带有 .js 的 ts 文件，会提示找不到文件，不带 .js 后缀会让 esm 模式下正常的用例找不到对应的 ts 文件
// https://github.com/kulshekhar/ts-jest/issues/1107
// https://github.com/facebook/jest/issues/6179
export default {
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  setupFilesAfterEnv: ['jest-extended/all'],
  testTimeout: 5 * 60 * 1000,
  testMatch: ['**/test/system/**/*.spec.js']
}
