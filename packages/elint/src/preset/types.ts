import type { ElintPlugin, ElintPluginOverridableKey } from '../plugin/types.js'

/**
 * elint preset 配置
 */
export interface ElintPreset {
  /**
   * 插件版本
   *
   * 用于缓存判断
   *
   * 当 preset 以 npm 包发布时，会忽略此参数
   */
  version?: string
  /**
   * 需要移动到根目录的的配置文件或文件夹
   *
   * 例如 `.eslintrc`, `.prettierrc`
   *
   * 设置了这个项目后，将会忽略所有 plugin 默认的配置文件列表
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
  /**
   * preset 所在的路径
   *
   * 当 preset 为依赖时，为 package.json 路径；
   * 当 preset 为指定文件时，为文件所在路径；
   * 否则将为 undefined
   */
  path?: string
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
