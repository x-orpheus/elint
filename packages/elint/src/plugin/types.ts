export type ElintPluginType = 'linter' | 'formatter'

export type ElintPluginOverridableKey = 'activateConfig'

export interface ElintPluginResult<T> {
  /**
   * pluginId
   */
  pluginId: string
  /**
   * 输入
   */
  input: string
  /**
   * 输出
   */
  output: string
  /**
   * lint / format 是否成功
   *
   * lint 类型下表示是否存在 error
   *
   * format 类型下表示内容是否和原始一致
   */
  success: boolean
  /**
   * 文件路径
   */
  filePath?: string
  /**
   * 经过格式化的结果消息
   */
  message?: string
  /**
   * 执行结果
   */
  result?: T
}

export interface ElintPluginOptions {
  /**
   * 文件路径
   */
  filePath?: string
  /**
   * 是否修复
   */
  fix: boolean
  /**
   * cwd
   */
  cwd: string
}

export interface ElintPluginVersion {
  version: string
  /**
   * 需要展示 version 的依赖
   */
  dependencies: {
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
   * 是否支持缓存
   *
   * 一个文件处理流上有任何插件不支持缓存，则此文件不会被缓存
   */
  cacheable: boolean
  /**
   * 执行函数
   */
  execute(text: string, options: Options): Promise<ElintPluginResult<Result>>
  getVersion(): ElintPluginVersion
  /**
   * 重置操作（例如清理配置缓存）
   */
  reset?(): void
}

export function isElintPlugin(value: unknown): value is ElintPlugin<unknown> {
  if (
    value &&
    typeof value === 'object' &&
    (value as ElintPlugin<unknown>).id &&
    (['formatter', 'linter'] as ElintPluginType[]).indexOf(
      (value as ElintPlugin<unknown>).type
    ) !== -1
  ) {
    return true
  }
  return false
}
