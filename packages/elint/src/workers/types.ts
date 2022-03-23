export type ElintWorkerType = 'linter' | 'formatter'

export type ElintWorkerActivateType = 'before-all' | 'file' | 'after-all'

export interface ElintWorkerResult<T> {
  /**
   * workerId
   */
  workerId: string
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

export interface ElintWorkerOptions {
  /**
   * 文件路径
   */
  filePath?: string
  /**
   * 是否在 git 环境中
   */
  isGit: boolean
  /**
   * 是否修复
   */
  fix: boolean
  /**
   * cwd
   */
  cwd: string
}

export interface ElintWorkerActivateConfig<Options extends ElintWorkerOptions> {
  /**
   * 支持的扩展名
   */
  extensions?: string[]
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
  activate?(options: Options): boolean
}

export interface ElintWorker<
  Result,
  Options extends ElintWorkerOptions = ElintWorkerOptions
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
  /**
   * 激活配置
   */
  activateConfig: ElintWorkerActivateConfig<Options>
  /**
   * 执行函数
   */
  execute(text: string, options: Options): Promise<ElintWorkerResult<Result>>
  /**
   * 重置操作（例如清理配置缓存）
   */
  reset?(): void
}

export interface ElintWorkerLinter<
  Result,
  Options extends ElintWorkerOptions = ElintWorkerOptions
> extends ElintWorker<Result, Options> {
  type: 'linter'
  /**
   * 是否支持缓存
   */
  cacheable: boolean
}

export interface ElintWorkerFormatter<
  Result,
  Options extends ElintWorkerOptions = ElintWorkerOptions
> extends ElintWorker<Result, Options> {
  type: 'formatter'
}
