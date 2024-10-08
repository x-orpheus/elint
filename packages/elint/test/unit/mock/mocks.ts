import {
  ElintPluginType,
  type ElintPlugin,
  type ElintPreset
} from '../../../src/index.js'

export const mockElintPlugin: ElintPlugin<unknown> = {
  name: 'elint-plugin-mock',
  title: 'mock',
  type: ElintPluginType.Linter,
  activateConfig: {
    extensions: ['.js']
  },
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
}

export const mockElintPreset: ElintPreset = {
  plugins: [mockElintPlugin]
}

export const mockElintPresetWithOverridePluginConfig: ElintPreset = {
  plugins: [mockElintPlugin],
  overridePluginConfig: {
    'elint-plugin-mock': {
      activateConfig: {
        extensions: ['.ts']
      }
    }
  }
}

export const mockElintPresetWithAllTypePlugins: ElintPreset = {
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
}
