import type Husky from 'husky'
import path from 'node:path'
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
      const result = husky(path.resolve(ctx.cwd, '.husky'))

      if (result) {
        throw new Error(result)
      }
    } else {
      throw new Error('husky is not installed')
    }
  }
})

export default elintPluginHusky
