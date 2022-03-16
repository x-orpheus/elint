module.exports = {
  globalSetup: './setup.js',
  globalTeardown: './teardown.js',
  setupFilesAfterEnv: ['jest-extended'],
  testTimeout: 5 * 60 * 1000,
  testMatch: [
    '**/test/system/**/*.spec.js'
  ]
}
