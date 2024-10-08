import path from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

/** @type {import('ts-jest').InitialOptionsTsJest} */
export default {
  rootDir: '../..',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+.[tj]sx?$': [
      'ts-jest',
      {
        useESM: true
      }
    ]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    // jest 28 识别了 exports 字段，但是没有识别 imports 字段
    // for chalk
    '#ansi-styles': path.join(
      require.resolve('chalk').split(`chalk${path.sep}`)[0],
      'chalk/source/vendor/ansi-styles/index.js'
    ),
    '#supports-color': path.join(
      require.resolve('chalk').split(`chalk${path.sep}`)[0],
      'chalk/source/vendor/supports-color/index.js'
    )
  },
  testMatch: ['**/test/unit/**/*.spec.ts'],
  testTimeout: 5 * 60 * 1000,
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/../../coverage'
}
