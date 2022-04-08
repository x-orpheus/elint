import { lintFiles, lintText, loadPresetAndPlugins, reset } from './elint.js'

import type { ElintOptions, ElintResult } from './types.js'

import type {
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions
} from './plugin/types.js'
import type { ElintPreset } from './preset/types.js'

export { lintFiles, lintText, loadPresetAndPlugins, reset }

export type {
  ElintOptions,
  ElintResult,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPreset
}
