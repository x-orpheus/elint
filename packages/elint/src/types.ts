import type {
  ElintPlugin,
  ElintPluginResultWithPluginData,
  ElintPluginType,
  InternalPlugin
} from './plugin/types.js'
import type { ElintPreset, InternalPreset } from './preset/types.js'

/**
 * elint 基础结果结构
 */
export interface ElintBaseResult {
  /**
   * 输入源码
   */
  source: string
  /**
   * 输出源码
   */
  output: string
  errorCount: number
  warningCount: number
}

/**
 * elint lint 结果结构
 */
export interface ElintResult<T = unknown> extends ElintBaseResult {
  /**
   * 文件路径
   */
  filePath?: string
  /**
   * 是否命中缓存
   */
  fromCache?: boolean
  /**
   * 各个 plugin 结果
   */
  pluginResults: ElintPluginResultWithPluginData<T>[]
}

/**
 * elint 内部 preset 和 plugins 加载后的数据结构
 */
export interface InternalLoadedPresetAndPlugins {
  internalPreset: InternalPreset
  internalPlugins: InternalPlugin[]
  pluginGroup: Record<ElintPluginType, ElintPlugin<unknown>[]>
}

/**
 * elint 函数基础参数
 */
export interface ElintBasicOptions {
  /**
   * 是否自动修复
   *
   * @default false
   */
  fix?: boolean
  /**
   * 预设
   */
  preset?: string | ElintPreset
  cwd?: string
  /**
   * @inner
   *
   * 内部使用参数
   */
  internalLoadedPresetAndPlugins?: InternalLoadedPresetAndPlugins
}

export interface ElintOptions extends ElintBasicOptions {
  /**
   * 是否将自动修复写入文件
   *
   * @default true
   */
  write?: boolean
  /**
   * 是否禁用默认忽略规则
   *
   * @default false
   */
  noIgnore?: boolean
  /**
   * 是否在 git 中调用
   *
   * 在 git 中调用将会调整一些默认行为
   *
   * 1. 仅会获取暂存区内满足传入参数的文件和内容
   * 2. fix 参数将强制改为 false，不进行自动修复
   *
   * @default false
   */
  git?: boolean
  /**
   * 是否开启缓存
   *
   * @default false
   */
  cache?: boolean
  /**
   * 缓存位置
   */
  cacheLocation?: string
}

/**
 * elint preset 和 plugin 加载函数上下文
 */
export interface ElintContext {
  cwd: string
  presetPath?: string
}
