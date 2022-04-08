import type {
  ElintPlugin,
  ElintPluginResult,
  ElintPluginType
} from './plugin/types.js'
import type { ElintPreset, InternalPreset } from './preset/types.js'
import type { ReportResult } from './utils/report.js'

/**
 * elint 执行结果结构
 */
export interface ElintResult {
  /**
   * 文件路径
   */
  filePath?: string
  /**
   * 文件原始内容
   */
  source: string
  /**
   * 文件输出
   */
  output: string
  /**
   * 执行整体结果
   */
  success: boolean
  /**
   * 命令行输出结果
   */
  reportResults: ReportResult[]
  /**
   * 各个 plugin 结果
   */
  pluginResults: ElintPluginResult<unknown>[]
}

/**
 * elint 内部 preset 和 plugins 加载后的数据结构
 */
export interface ElintLoadedPresetAndPlugins {
  internalPreset?: InternalPreset
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
  /**
   * 配置 plugins，不可与 preset 同时设置
   */
  plugins?: (string | ElintPlugin<unknown>)[]
  cwd?: string
  /**
   * @inner
   *
   * 内部使用参数
   */
  loadedPrestAndPlugins?: ElintLoadedPresetAndPlugins
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
}

/**
 * elint preset 和 plugin 加载函数上下文
 */
export interface ElintContext {
  cwd: string
  presetPath?: string
}
