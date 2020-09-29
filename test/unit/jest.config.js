module.exports = {
  testMatch: [
    '**/test/unit/**/*.spec.js'
  ],
  setupFilesAfterEnv: ['jest-extended'],
  collectCoverage: true,
  coverageDirectory: '../../coverage'
}
