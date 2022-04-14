import type {
  ElintPlugin,
  ElintPluginResultWithPluginData,
  ElintPluginType
} from './plugin/types.js'
import type { ElintPreset, InternalPreset } from './preset/types.js'

/**
 * elint 基础结果结构
 */
export interface ElintBaseResult {
  /**
   * 文件路径
   */
  filePath?: string
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
export interface ElintResult extends ElintBaseResult {
  /**
   * 是否命中缓存
   */
  fromCache?: boolean
  /**
   * 各个 plugin 结果
   */
  pluginResults: ElintPluginResultWithPluginData<unknown>[]
}

/**
 * elint 内部 preset 和 plugins 加载后的数据结构
 */
export interface InternalLoadedPresetAndPlugins {
  internalPreset: InternalPreset
  loadedPlugins: ElintPlugin<unknown>[]
  loadedPluginGroup: Record<ElintPluginType, ElintPlugin<unknown>[]>
}

/**
 * elint 函数基础参数
 */
export interface ElintBasicOptions {
  /**
   * 是否自动修复
   */
  fix?: boolean
  /**
   * 是否检查格式
   */
  style?: boolean
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
  internalLoadedPrestAndPlugins?: InternalLoadedPresetAndPlugins
}

export interface ElintOptions extends ElintBasicOptions {
  /**
   * 是否将自动修复写入文件
   *
   * @default `true`
   */
  write?: boolean
  /**
   * 是否禁用默认忽略规则
   */
  noIgnore?: boolean
  /**
   * 是否在 git 中调用
   *
   * 在 git 中调用将会调整一些默认行为
   *
   * 1. 仅会获取暂存区内满足传入参数的文件和内容
   * 2. fix 参数将强制改为 false，不进行自动修复
   */
  git?: boolean
  /**
   * 是否对结果进行缓存
   *
   * 当项目中没有 preset 时不进行缓存
   */
  cache?: boolean
}

/**
 * elint preset 和 plugin 加载函数上下文
 */
export interface ElintContext {
  cwd: string
  presetPath?: string
}
