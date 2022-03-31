export default {
  rootDir: '../..',
  preset: 'ts-jest',
  extensionsToTreatAsEsm: ['.ts'],
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // for chalk
    '#ansi-styles': 'chalk/source/vendor/ansi-styles/index.js',
    '#supports-color': 'chalk/source/vendor/supports-color/index.js'
  },
  testMatch: ['**/test/unit/**/*.spec.ts'],
  testTimeout: 5 * 60 * 1000,
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverage: true,
  coverageDirectory: '../../../../coverage'
}
