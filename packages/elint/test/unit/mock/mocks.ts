import type { ElintPlugin, ElintPreset } from '../../../src/index.js'

export const mockElintPlugin: ElintPlugin<unknown> = {
  name: 'elint-plugin-mock',
  title: 'mock',
  type: 'linter',
  activateConfig: {
    extensions: []
  },
  async execute() {
    return {
      errorCount: 0,
      warningCount: 0,
      source: '',
      output: ''
    }
  }
}

export const mockElintPreset: ElintPreset = {
  plugins: [mockElintPlugin]
}
