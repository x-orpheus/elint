import { lintFiles, lintText } from './elint'

import type { ElintOptions, ElintResult } from './elint'

import type {
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions
} from './plugin/types'

export { lintFiles, lintText }

export type {
  ElintOptions,
  ElintResult,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions
}
