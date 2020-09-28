module.exports = {
  globalSetup: './utils/init.js',
  globalTeardown: './utils/clean.js',
  setupFilesAfterEnv: ['jest-extended'],
  testTimeout: 5 * 60 * 1000,
  testMatch: [
    '**/test/system/**/*.spec.js'
  ]
}
