import { lintFiles, lintText, loadPresetAndPlugins } from './elint'

import type { ElintOptions, ElintResult } from './elint'

import type {
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions
} from './plugin/types'
import type { ElintPreset } from './preset/types'

export { lintFiles, lintText, loadPresetAndPlugins }

export type {
  ElintOptions,
  ElintResult,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPreset
}
