import type Husky from 'husky'
import { defineElintPlugin, ElintPluginType } from 'elint'

let husky: typeof Husky | undefined

const elintPluginHusky = defineElintPlugin<null>({
  name: '@elint/plugin-husky',
  title: 'Husky',
  type: ElintPluginType.Common,
  configFiles: ['.husky'],
  activateConfig: {
    activate() {
      return false
    }
  },
  async load(ctx, importFromPreset) {
    husky = await importFromPreset('husky')
  },
  async prepare(ctx) {
    if (husky) {
      husky(ctx.cwd)
    } else {
      throw new Error('husky is not installed')
    }
  },
  async execute(text) {
    return {
      source: text,
      output: text,
      errorCount: 0,
      warningCount: 0
    }
  }
})

export default elintPluginHusky
