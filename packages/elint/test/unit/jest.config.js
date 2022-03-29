export default {
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: ['**/test/unit/**/*.spec.ts'],
  testTimeout: 5 * 60 * 1000,
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverage: true,
  coverageDirectory: '../../coverage'
}
