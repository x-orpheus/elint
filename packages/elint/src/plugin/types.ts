import type { ElintBaseResult } from '../types.js'

/**
 * elint 插件类型
 *
 * - `linter` lint 检查工具
 * - `formatter` 格式化工具
 * - `common` 公共检查工具
 */
export type ElintPluginType = 'linter' | 'formatter' | 'common'

/**
 * 支持 preset 覆盖的配置参数
 */
export type ElintPluginOverridableKey = 'activateConfig'

export interface ElintPluginResult<T> extends ElintBaseResult {
  /**
   * 经过格式化，可以在命令行输出的消息
   */
  message?: string
  /**
   * 执行结果
   */
  result?: T
}

export interface ElintPluginResultWithPluginData<T>
  extends ElintPluginResult<T> {
  /**
   * 插件标识
   */
  pluginId: string
  pluginName: string
}

export interface ElintPluginOptions {
  /**
   * 文件路径
   */
  filePath?: string
  /**
   * 文件源码
   */
  source: string
  /**
   * 是否修复错误
   */
  fix: boolean
  /**
   * 是否检查格式
   */
  style: boolean
  /**
   * cwd
   */
  cwd: string
}

export interface ElintPluginVersion {
  /**
   * 插件版本号
   */
  version: string
  /**
   * 需要展示 version 的依赖
   */
  dependencies?: {
    [name: string]: string
  }
}

export interface ElintPluginActivateConfig<Options extends ElintPluginOptions> {
  /**
   * 支持的扩展名
   */
  extensions?: string[]
  /**
   * 是否使用当前 plugin
   *
   * type 非 file 只有传入 activate 才有可能激活
   */
  activate?(options: Options): boolean
}

export interface ElintPlugin<
  Result,
  Options extends ElintPluginOptions = ElintPluginOptions
> {
  /**
   * plugin 名称(唯一)
   */
  id: string
  /**
   * 可读名称，用于控制台输出
   */
  name: string
  /**
   * 类型
   */
  type: ElintPluginType
  /**
   * 激活配置
   */
  activateConfig: ElintPluginActivateConfig<Options>
  /**
   * 执行函数
   */
  execute(text: string, options: Options): Promise<ElintPluginResult<Result>>
  getVersion(): ElintPluginVersion
  /**
   * 重置操作（例如清理配置缓存）
   */
  reset?(): void | Promise<void>
}

export function isElintPlugin(value: unknown): value is ElintPlugin<unknown> {
  if (
    value &&
    typeof value === 'object' &&
    (value as ElintPlugin<unknown>).id &&
    (['formatter', 'linter', 'common'] as ElintPluginType[]).indexOf(
      (value as ElintPlugin<unknown>).type
    ) !== -1
  ) {
    return true
  }
  return false
}
