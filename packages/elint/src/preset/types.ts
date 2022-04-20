import type { ElintPlugin, ElintPluginOverridableKey } from '../plugin/types.js'

/**
 * elint preset 配置
 */
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
  plugins: (string | ElintPlugin<unknown>)[]
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

/**
 * 内部使用的 preset 结构
 */
export interface InternalPreset {
  name: string
  version: string
  path: string
  preset: ElintPreset
}

export function isElintPreset(value: unknown): value is ElintPreset {
  if (
    value &&
    typeof value === 'object' &&
    Array.isArray((value as ElintPreset).plugins)
  ) {
    return true
  }

  return false
}
