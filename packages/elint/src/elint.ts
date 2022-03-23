import _debug from 'debug'
import fs from 'fs-extra'
import chalk from 'chalk'
import walker from './walker'
import { report, createElintErrorReport, ReportResult } from './utils/report'
import isGitHooks from './utils/is-git-hooks'
import { defaultWorkers } from './config'
import {
  executeElintWorker,
  groupElintWorkersByActivateType,
  groupElintWorkersByType,
  loadElintWorkers
} from './workers'
import { ElintWorkerOptions, ElintWorkerResult } from './workers/types'
// const notifier = require('./notifier')

const debug = _debug('elint:main')

export interface ElintFileResult {
  /**
   * 文件路径
   */
  filePath: string
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
   * 输出格式化结果
   */
  reports: ReportResult[]
  /**
   * 各个 worker 结果
   */
  workerResults: ElintWorkerResult<unknown>[]
}

export interface ElintOptions {
  /**
   * 是否自动修复
   */
  fix?: boolean
  /**
   * 是否将自动修复写入文件
   *
   * @default `true`
   */
  write?: boolean
  /**
   * 是否检查格式
   */
  style?: boolean
  /**
   * 是否禁用默认忽略规则
   */
  noIgnore?: boolean
  /**
   * 检查是否在 git 中调用
   *
   * 在 git 中调用将会调整一些默认行为
   *
   * 1. 仅会获取暂存区内满足传入参数的文件和内容
   * 2. fix 参数将强制改为 false，不进行自动修复
   *
   * @default true
   */
  checkGit?: boolean
  /**
   * 配置 workers
   */
  workers?: string[]
  cwd?: string
}

export interface ElintResult {
  success: boolean
  message: string
  reports: ReportResult[]
  fileResults: ElintFileResult[]
}

/**
 * 主函数
 *
 * @param files 待执行 lint 的文件
 * @param options options
 * @returns
 */
async function elint(
  files: string[],
  {
    fix: optionFix = false,
    write = true,
    style = false,
    noIgnore = false,
    checkGit = true,
    workers = defaultWorkers,
    cwd = process.cwd()
  }: ElintOptions
): Promise<ElintResult> {
  const startTime = Date.now()

  const isGit = checkGit ? await isGitHooks() : false

  // 调整 fix 配置
  const fix = isGit ? false : optionFix

  debug('parsed options: %o', {
    fix,
    write,
    style,
    noIgnore,
    checkGit,
    workers,
    cwd
  } as ElintOptions)

  const fileList = await walker(files, {
    noIgnore,
    isGit
  })

  const loadedElintWorkers = loadElintWorkers(workers)

  debug(
    'loaded elint workers: %o',
    loadedElintWorkers.map((worker) => worker.id)
  )

  const elintResult: ElintResult = {
    success: true,
    message: '',
    reports: [],
    fileResults: []
  }

  // 没有匹配到任何文件或没有可用的 worker，直接退出
  if (!fileList.length || !loadedElintWorkers.length) {
    return elintResult
  }

  const activateTypeWorkerGroup =
    groupElintWorkersByActivateType(loadedElintWorkers)

  const fileWorkerGroup = groupElintWorkersByType(
    activateTypeWorkerGroup.file || []
  )

  const tasks: Promise<void>[] = []

  const workerBaseOptions: ElintWorkerOptions = {
    isGit,
    fix,
    cwd
  }

  if (activateTypeWorkerGroup['before-all']) {
    for (const worker of activateTypeWorkerGroup['before-all']) {
      const executeResult = await executeElintWorker(worker, workerBaseOptions)

      elintResult.success &&= executeResult.success

      if (executeResult.report) {
        elintResult.reports.push(executeResult.report)
      }
    }
  }

  debug(`elint complete before-all workers in: ${Date.now() - startTime}ms`)

  if (activateTypeWorkerGroup.file.length) {
    fileList.forEach((filePath) => {
      const task = async (): Promise<void> => {
        const elintFileResult: ElintFileResult = {
          filePath: '',
          source: '',
          output: '',
          success: true,
          reports: [],
          workerResults: []
        }

        try {
          if (typeof filePath === 'string') {
            elintFileResult.filePath = filePath
            elintFileResult.source = fs.readFileSync(filePath, 'utf-8')
          } else {
            elintFileResult.filePath = filePath.filePath
            elintFileResult.source = filePath.fileContent
          }

          if (typeof elintFileResult.source !== 'string') {
            throw new Error('This file is not source code.')
          }

          const workerOptions: ElintWorkerOptions = {
            ...workerBaseOptions,
            filePath: elintFileResult.filePath
          }

          elintFileResult.output = elintFileResult.source

          if (style) {
            for (const formatterWorker of fileWorkerGroup.formatter) {
              const executeResult = await executeElintWorker(
                formatterWorker,
                workerOptions,
                elintFileResult.output
              )

              if (executeResult.workerResult) {
                elintFileResult.output = executeResult.workerResult.output
                elintFileResult.workerResults.push(executeResult.workerResult)
              }

              if (executeResult.report) {
                elintFileResult.reports.push(executeResult.report)
              }
            }
          }

          for (const linterWorker of fileWorkerGroup.linter) {
            const executeResult = await executeElintWorker(
              linterWorker,
              workerOptions,
              elintFileResult.output
            )

            elintFileResult.success &&= executeResult.success

            if (executeResult.workerResult) {
              elintFileResult.output = executeResult.workerResult.output
              elintFileResult.workerResults.push(executeResult.workerResult)
            }

            if (executeResult.report) {
              elintFileResult.reports.push(executeResult.report)
            }
          }

          const isModified = elintFileResult.output !== elintFileResult.source

          if (isModified) {
            if (fix) {
              if (write) {
                fs.writeFileSync(
                  elintFileResult.filePath,
                  elintFileResult.output,
                  {
                    encoding: 'utf-8'
                  }
                )
              }
            } else if (style) {
              elintFileResult.success = false
              elintFileResult.reports.push(
                createElintErrorReport(
                  'elint - formatter',
                  elintFileResult.filePath,
                  undefined,
                  `${chalk.red.bold('!')} Not formatted`
                )
              )
            }
          }
        } catch (e) {
          elintFileResult.success = false
          elintFileResult.reports.push(
            createElintErrorReport('elint', elintFileResult.filePath, e)
          )

          debug(`[${filePath}] error: ${e}`)
        }

        elintResult.success &&= elintFileResult.success
        elintResult.reports.push(...elintFileResult.reports)
        elintResult.fileResults.push(elintFileResult)
      }

      tasks.push(task())
    })
  }

  await Promise.all(tasks)

  debug(`elint complete file workers in: ${Date.now() - startTime}ms`)

  if (activateTypeWorkerGroup['after-all']) {
    for (const worker of activateTypeWorkerGroup['after-all']) {
      const executeResult = await executeElintWorker(worker, workerBaseOptions)

      elintResult.success &&= executeResult.success

      if (executeResult.report) {
        elintResult.reports.push(executeResult.report)
      }
    }
  }

  debug(`elint complete after-all workers in: ${Date.now() - startTime}ms`)

  if (!elintResult.reports.length) {
    elintResult.reports.push({
      name: 'elint',
      success: true,
      output: ''
    })
  }

  elintResult.message = report(elintResult.reports)

  debug(`elint complete in: ${Date.now() - startTime}ms`)

  return elintResult
}

export default elint
