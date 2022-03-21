export type ElintWorkerType = 'linter' | 'formatter'

export type ElintWorkerActivateType = 'before-all' | 'file' | 'after-all'

export interface ElintWorkerResult<T> {
  /**
   * workerId
   */
  workerId: string
  /**
   * 文件路径
   */
  filePath?: string
  /**
   * 输入文本
   */
  input: string
  /**
   * 输出
   */
  output: string
  /**
   * 格式化结果信息
   */
  message?: string
  /**
   * 执行中的错误
   */
  error?: Error
  /**
   * lint 的内容是否存在 error
   *
   * format 后的内容是否和原始一致
   *
   * 当 error 时，这个值总为 false
   */
  success: boolean
  /**
   * 执行结果
   */
  result?: T
}

export interface ElintWorkerOption {
  filePath?: string
  /**
   * cwd
   */
  cwd: string
}

export interface ElintWorkerActivateOption {
  filePath?: string
  isGit?: boolean
  fix?: boolean
  cwd?: string
}

export interface ElintWorkerActivateConfig {
  /**
   * 支持的扩展名
   */
  extnameList?: string[]
  /**
   * 执行类型
   *
   * 全局 / 文件
   */
  type: ElintWorkerActivateType
  /**
   * 是否使用当前 worker
   *
   * type 非 file 只有传入 activate 才有可能激活
   */
  activate?(option: ElintWorkerActivateOption): boolean
}

export interface ElintWorker<
  Result,
  Option extends ElintWorkerOption = ElintWorkerOption
> {
  /**
   * worker 名称(唯一)
   */
  id: string
  /**
   * worker 可读名称
   */
  name: string
  /**
   * 类型
   */
  type: ElintWorkerType
  activateConfig: ElintWorkerActivateConfig
  /**
   * 对文本执行 worker
   */
  execute(text: string, option: Option): Promise<ElintWorkerResult<Result>>
  /**
   * 重置操作（例如清理配置缓存）
   */
  reset?(): void
}

export interface ElintWorkerLinterOption extends ElintWorkerOption {
  /**
   * 是否修复
   */
  fix: boolean
}

export interface ElintWorkerLinter<
  Result,
  Option extends ElintWorkerLinterOption = ElintWorkerLinterOption
> extends ElintWorker<Result, Option> {
  type: 'linter'
  /**
   * 是否支持缓存
   */
  cacheable: boolean
}

export interface ElintWorkerFormatter<
  Result,
  Option extends ElintWorkerOption = ElintWorkerOption
> extends ElintWorker<Result, Option> {
  type: 'formatter'
}
