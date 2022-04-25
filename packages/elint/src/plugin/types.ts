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

export interface ElintPluginResult<Result> extends ElintBaseResult {
  /**
   * 经过格式化，可以在命令行输出的消息
   */
  message?: string
  /**
   * 执行结果
   */
  result?: Result
}

export interface ElintPluginOptions {
  /**
   * 文件路径
   */
  filePath?: string
  /**
   * 文件源码
   *
   * 与 execute 函数的第一个参数的区别：
   * 这个值是文件原始内容，而那个值可能是经过其他 plugin 处理后的文本
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

export interface ElintPluginActivateConfig {
  /**
   * 支持的扩展名
   */
  extensions?: string[]
  /**
   * 是否使用当前 plugin
   *
   * type 非 file 只有传入 activate 才有可能激活
   */
  activate?(options: ElintPluginOptions): boolean
}

export interface ElintPlugin<Result> {
  /**
   * plugin 名称(唯一)
   */
  name: string
  /**
   * 可读名称，用于控制台输出
   */
  title: string
  /**
   * 类型
   */
  type: ElintPluginType
  /**
   * 激活配置
   */
  activateConfig: ElintPluginActivateConfig
  /**
   * 执行函数
   */
  execute(
    text: string,
    options: ElintPluginOptions
  ): Promise<ElintPluginResult<Result>>
  /**
   * 重置操作（例如清理配置缓存）
   */
  reset?(): void | Promise<void>
}

export interface ElintPluginResultWithPluginData<Result>
  extends ElintPluginResult<Result> {
  pluginData: Pick<ElintPlugin<unknown>, 'name' | 'title' | 'type'>
}

/**
 * 内部使用的 plugin 结构
 */
export interface InternalPlugin {
  name: string
  /**
   * 插件 package.json 所在路径
   *
   * 当 package.json 不存在时这个值为 undefined
   */
  path?: string
  plugin: ElintPlugin<unknown>
}

export function isElintPlugin(value: unknown): value is ElintPlugin<unknown> {
  if (
    value &&
    typeof value === 'object' &&
    (value as ElintPlugin<unknown>).name &&
    (['formatter', 'linter', 'common'] as ElintPluginType[]).indexOf(
      (value as ElintPlugin<unknown>).type
    ) !== -1
  ) {
    return true
  }
  return false
}
