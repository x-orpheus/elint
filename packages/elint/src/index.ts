import { lintFiles, lintText } from './elint.js'

import type { ElintOptions, ElintResult, ElintInstallOptions } from './types.js'

import { install } from './core/install.js'
import { reset } from './core/reset.js'
import { prepare } from './core/prepare.js'

import type {
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPluginActivateConfig
} from './plugin/types.js'
import {
  defineElintPlugin,
  ElintPluginType,
  isElintPlugin
} from './plugin/types.js'
import { testPlugin } from './plugin/test.js'

import type { ElintPreset } from './preset/types.js'
import { defineElintPreset, isElintPreset } from './preset/types.js'

export {
  lintFiles,
  lintText,
  reset,
  prepare,
  install,
  testPlugin,
  defineElintPreset,
  isElintPreset,
  defineElintPlugin,
  isElintPlugin,
  ElintPluginType
}

export type {
  ElintOptions,
  ElintResult,
  ElintPlugin,
  ElintPluginResult,
  ElintPluginOptions,
  ElintPluginActivateConfig,
  ElintPreset,
  ElintInstallOptions
}
