module.exports = {
  testMatch: [
    '**/test/unit/**/*.spec.js'
  ],
  testTimeout: 5 * 60 * 1000,
  setupFilesAfterEnv: ['jest-extended'],
  collectCoverage: true,
  coverageDirectory: '../../coverage'
}
