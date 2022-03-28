import { lintFiles, lintText } from './elint'

import type { ElintOptions, ElintResult } from './elint'

import type {
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions
} from './plugin/types'
import type { ElintPreset } from './types/preset'

export { lintFiles, lintText }

export type {
  ElintOptions,
  ElintResult,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPreset
}
