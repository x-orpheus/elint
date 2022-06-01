import type { ElintPlugin, ElintPreset } from '../../../src/index.js'

export const mockElintPlugin: ElintPlugin<unknown> = {
  name: 'elint-plugin-mock',
  title: 'mock',
  type: 'linter',
  activateConfig: {
    extensions: ['.js']
  },
  async execute(text) {
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
