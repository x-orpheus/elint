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
    const huskyModule = await importFromPreset<{ default: typeof Husky }>(
      'husky'
    )

    husky = huskyModule.default
  },
  prepare(ctx) {
    if (husky) {
      const result = husky(ctx.cwd)

      if (result) {
        throw new Error(result)
      }
    } else {
      throw new Error('husky is not installed')
    }
  },
  execute(text) {
    return {
      source: text,
      output: text,
      errorCount: 0,
      warningCount: 0
    }
  }
})

export default elintPluginHusky
