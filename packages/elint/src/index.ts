import { lintFiles, lintText, reset } from './elint.js'

import type { ElintOptions, ElintResult } from './types.js'

import type {
  ElintPluginType,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPluginActivateConfig
} from './plugin/types.js'
import { testElintPlugin } from './plugin/test.js'

import type { ElintPreset } from './preset/types.js'

export { lintFiles, lintText, reset, testElintPlugin }

export type {
  ElintOptions,
  ElintResult,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPluginType,
  ElintPluginActivateConfig,
  ElintPreset
}
