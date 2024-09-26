import { lintFiles, lintText, reset, prepare } from './elint.js'

import type { ElintOptions, ElintResult } from './types.js'

import type {
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPluginActivateConfig
} from './plugin/types.js'
import { defineElintPlugin, ElintPluginType } from './plugin/types.js'
import { testPlugin } from './plugin/test.js'

import type { ElintPreset } from './preset/types.js'

export {
  lintFiles,
  lintText,
  reset,
  testPlugin,
  prepare,
  defineElintPlugin,
  ElintPluginType
}

export type ElintLintFiles = typeof lintFiles
export type ElintLintText = typeof lintText
export type ElintReset = typeof reset
export type ElintTestPlugin = typeof testPlugin

export type {
  ElintOptions,
  ElintResult,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPluginActivateConfig,
  ElintPreset
}
