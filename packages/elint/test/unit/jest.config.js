import path from 'path'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

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
    // jest 28 识别了 exports 字段，但是没有识别 imports 字段
    // for chalk
    '#ansi-styles': path.join(
      require.resolve('chalk').split('chalk/')[0],
      'chalk/source/vendor/ansi-styles/index.js'
    ),
    '#supports-color': path.join(
      require.resolve('chalk').split('chalk/')[0],
      'chalk/source/vendor/supports-color/index.js'
    )
  },
  testMatch: ['**/test/unit/**/*.spec.ts'],
  testTimeout: 5 * 60 * 1000,
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverage: true,
  coverageDirectory: '../../../../coverage'
}
