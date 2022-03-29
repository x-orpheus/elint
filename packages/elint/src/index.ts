import { lintFiles, lintText, loadPresetAndPlugins } from './elint.js'

import type { ElintOptions, ElintResult } from './elint.js'

import type {
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions
} from './plugin/types.js'
import type { ElintPreset } from './preset/types.js'

export { lintFiles, lintText, loadPresetAndPlugins }

export type {
  ElintOptions,
  ElintResult,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPreset
}
