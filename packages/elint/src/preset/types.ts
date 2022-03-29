import { ElintPlugin, ElintPluginOverridableKey } from '../plugin/types.js'

export interface ElintPreset {
  /**
   * 需要移动到根目录的的配置文件
   *
   * 例如 `.eslintrc`, `.prettierrc`
   */
  configFiles?: string[]
  /**
   * 启用的 plugin 名称
   */
  plugins: string[]
  /**
   * 覆盖 plugin 配置
   */
  overridePluginConfig?: {
    [pluginId: string]: Pick<ElintPlugin<unknown>, ElintPluginOverridableKey>
  }
  /**
   * 各种工具的自定义配置放在这里
   */
  configs?: {
    [key: string]: unknown
  }
}

export interface InternalElintPreset {
  id: string
  version: string
  path: string
  preset: ElintPreset
}

export function isElintPreset(value: unknown): value is ElintPreset {
  if (value && typeof value === 'object' && (value as ElintPreset).plugins) {
    return true
  }

  return false
}
