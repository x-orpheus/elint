import type { ElintBaseResult, ElintContext } from '../types.js'

/**
 * elint 插件类型
 *
 * - `Linter` lint 检查工具
 * - `Formatter` 格式化工具
 * - `Common` 公共检查工具
 */
export enum ElintPluginType {
  Common = 0,
  Linter = 9,
  Formatter = 99
}

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
   * cwd
   */
  cwd: string
  /**
   * 是否二进制文件，如果是二进制文件，则 text 和 source 均为空字符串，读取文件需要插件内部自行处理
   */
  isBinary?: boolean
}

export interface ElintPluginActivateConfig {
  /**
   * 支持的扩展名
   */
  extensions?: string[]
  /**
   * 是否激活当前 plugin
   *
   * 如果传入 extensions 会在判断扩展名后执行此函数
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
   * 插件类型，是一个数字
   *
   * 大于 0 的插件会对每个文件执行，数值越小的越先执行
   *
   * 小于等于 0 的插件是通用插件，不会对文件执行
   */
  type: ElintPluginType | number
  /**
   * 是否需要格式检查器
   *
   * 格式化检查器会对所有插件执行前和执行后的文本进行比较，如果不一致，则提示文本未格式化
   *
   * 如果某个文件执行的插件列表中包含 Formatter，将会自动开启此检查
   *
   * 格式化检查器仅对非二进制文本文件生效
   */
  needFormatChecker?: boolean
  /**
   * 激活配置
   */
  activateConfig: ElintPluginActivateConfig
  /**
   * 配置文件列表
   *
   * 在 elint prepare 时，会将 preset 中的配置文件拷贝到项目目录中
   *
   * 如果 preset 配置了全局的 configFiles，此时这个配置项将被忽略
   */
  configFiles?: string[]
  /**
   * 准备操作
   *
   * 此函数仅在执行 elint prepare 时被调用，一般用于做一些准备操作，不会在插件执行前调用
   *
   * 例如 husky 插件会在这一步来安装 husky 自己
   */
  prepare?: (
    ctx: ElintContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importFromPreset: (id: string) => Promise<any>
  ) => Promise<void>
  /**
   * 加载函数，用于加载依赖
   *
   * 此函数会在所有插件行为前调用，也可以做一些初始化操作
   *
   * 因为 elint 推荐将 plugin 的 peerDependencies 安装在 preset 里，
   * 如果项目中存在多个版本的依赖（例如 eslint），可能会导致 plugin 中导入的不是正确的版本，
   * 因此可以通过 load 函数控制依赖加载的位置
   */
  load?(
    ctx: ElintContext,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    importFromPreset: (id: string) => Promise<any>
  ): Promise<void>
  /**
   * 执行函数
   *
   * 会对每个文件/文本执行
   */
  execute(
    text: string,
    options: ElintPluginOptions
  ): Promise<ElintPluginResult<Result>>
  /**
   * 重置操作（例如清理配置缓存）
   *
   * 此函数仅在执行 elint reset 时被调用，不会在插件执行时调用
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
    typeof (value as ElintPlugin<unknown>).type === 'number'
  ) {
    return true
  }
  return false
}

export function defineElintPlugin<Result>(
  plugin: ElintPlugin<Result>
): ElintPlugin<Result> {
  return plugin
}
