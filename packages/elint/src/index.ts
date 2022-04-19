import { lintFiles, lintText, reset } from './elint.js'

import type { ElintOptions, ElintResult } from './types.js'

import type {
  ElintPluginType,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPluginVersion,
  ElintPluginActivateConfig,
  ElintPluginTestResult
} from './plugin/types.js'
import { testElintPlugin } from './plugin/execute.js'

import type { ElintPreset } from './preset/types.js'

export { lintFiles, lintText, reset, testElintPlugin }

export type {
  ElintOptions,
  ElintResult,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPluginType,
  ElintPluginVersion,
  ElintPluginActivateConfig,
  ElintPluginTestResult,
  ElintPreset
}
