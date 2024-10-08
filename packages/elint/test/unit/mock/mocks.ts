import {
  defineElintPlugin,
  defineElintPreset,
  ElintPluginType
} from '../../../src/index.js'

export const mockElintPlugin = defineElintPlugin<unknown>({
  name: 'elint-plugin-mock',
  title: 'mock',
  type: ElintPluginType.Linter,
  activateConfig: {
    extensions: ['.js']
  },
  prepare() {},
  execute(text) {
    return {
      errorCount: 0,
      warningCount: 0,
      source: text,
      output: text
    }
  },
  reset() {
    // empty
  }
})

export const mockElintPreset = defineElintPreset({
  plugins: [mockElintPlugin]
})

export const mockElintPresetWithOverridePluginConfig = defineElintPreset({
  plugins: [mockElintPlugin],
  overridePluginConfig: {
    'elint-plugin-mock': {
      activateConfig: {
        extensions: ['.ts']
      }
    }
  }
})

export const mockElintPresetWithAllTypePlugins = defineElintPreset({
  plugins: [
    {
      ...mockElintPlugin,
      name: 'elint-plugin-mock-formatter',
      title: 'mock-formatter',
      type: ElintPluginType.Formatter
    },
    {
      ...mockElintPlugin,
      name: 'elint-plugin-mock-linter',
      title: 'mock-linter',
      type: ElintPluginType.Linter
    },
    {
      ...mockElintPlugin,
      name: 'elint-plugin-mock-common',
      title: 'mock-common',
      type: ElintPluginType.Common
    }
  ]
})
