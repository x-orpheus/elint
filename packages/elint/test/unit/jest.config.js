import { createDefaultEsmPreset } from 'ts-jest'

const defaultPreset = createDefaultEsmPreset()

/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  ...defaultPreset,
  rootDir: '../..',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },
  testMatch: ['**/test/unit/**/*.spec.ts'],
  testTimeout: 5 * 60 * 1000,
  setupFilesAfterEnv: ['jest-extended/all'],
  collectCoverage: true,
  coverageDirectory: '<rootDir>/../../coverage'
}
