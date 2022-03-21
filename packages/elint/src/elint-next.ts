import _debug from 'debug'
import fs from 'fs-extra'
import chalk from 'chalk'
import walker from './walker'
import report, { ReportResult } from './utils/report'
import isGitHooks from './utils/is-git-hooks'
import { defaultWorkers } from './config'
import {
  checkElintWorkerActivation,
  groupElintWorkersByActivateType,
  groupElintWorkersByType,
  loadElintWorkers
} from './workers-new'
import { ElintWorkerActivateOption } from './workers-new/worker'
// const notifier = require('./notifier')

const debug = _debug('elint:main')

export interface FileResult {
  filePath: string
  /**
   * 文件原始内容
   */
  fileContent: string
  /**
   * 文件输出
   */
  output: string
  success: boolean
}

export interface ElintOptions {
  fix?: boolean
  prettier?: boolean
  workers?: string[]
}

export interface ElintResult {
  success: boolean
  message: string
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
  options: ElintOptions
): Promise<ElintResult> {
  const fileList = await walker(files, options)

  const { workers = defaultWorkers } = options

  const loadedElintWorkers = loadElintWorkers(workers)

  // 没有匹配到任何文件，直接退出
  if (!fileList.length || !loadedElintWorkers.length) {
    return {
      success: true,
      message: ''
    }
  }

  const activateTypeWorkerGroup =
    groupElintWorkersByActivateType(loadedElintWorkers)

  const fileWorkerGroup = groupElintWorkersByType(
    activateTypeWorkerGroup.file || []
  )

  // 处理 fix
  const isGit = await isGitHooks()

  const cwd = process.cwd()

  if (isGit) {
    options.fix = false
  }

  const { fix = false, prettier: format = false } = options

  debug('parsed options: %o', options)

  const tasks: Promise<void>[] = []

  let success = true
  const reportResult: ReportResult[] = []

  const workerActivateBaseOption: ElintWorkerActivateOption = {
    isGit,
    fix
  }

  if (activateTypeWorkerGroup['before-all']) {
    for (const worker of activateTypeWorkerGroup['before-all']) {
      if (checkElintWorkerActivation(worker, workerActivateBaseOption)) {
        const result = await worker.execute('', { cwd })

        success = success && result.success

        reportResult.push({
          name: worker.name,
          success: result.success,
          output: result.message || ''
        })
      }
    }
  }

  if (activateTypeWorkerGroup.file.length) {
    fileList.forEach((filePath) => {
      const task = async (): Promise<void> => {
        const fileResult: FileResult = {
          filePath: '',
          fileContent: '',
          output: '',
          success: true
        }

        if (typeof filePath === 'string') {
          fileResult.filePath = filePath
          try {
            fileResult.fileContent = fs.readFileSync(filePath, 'utf-8')
          } catch (e) {
            success = false
            reportResult.push({
              name: 'elint',
              success: false,
              output: `${chalk.underline(filePath)}\n  ${chalk.red('error:')} ${
                (e as Error).message
              }\n\n`
            })
            return
          }
        } else {
          fileResult.filePath = filePath.fileName
          fileResult.fileContent = filePath.fileContent
        }

        if (typeof fileResult.fileContent !== 'string') {
          success = false
          reportResult.push({
            name: 'elint',
            success: false,
            output: `${chalk.underline(filePath)}\n  ${chalk.red(
              'error:'
            )} This file is not source code.\n\n`
          })
          return
        }

        const workerActivateOption: ElintWorkerActivateOption = {
          ...workerActivateBaseOption,
          filePath: fileResult.filePath
        }

        fileResult.output = fileResult.fileContent

        if (format) {
          for (const formatterWorker of fileWorkerGroup.formatter) {
            if (
              !checkElintWorkerActivation(formatterWorker, workerActivateOption)
            ) {
              continue
            }
            const formatResult = await formatterWorker.execute(
              fileResult.output,
              {
                cwd,
                filePath: fileResult.filePath
              }
            )

            fileResult.output = formatResult.output

            if (formatResult.message) {
              reportResult.push({
                name: formatterWorker.name,
                success: formatResult.success,
                output: formatResult.message
              })
            }
          }
        }

        for (const linterWorker of fileWorkerGroup.linter) {
          if (!checkElintWorkerActivation(linterWorker, workerActivateOption)) {
            continue
          }

          const lintResult = await linterWorker.execute(fileResult.output, {
            cwd,
            fix,
            filePath: fileResult.filePath
          })

          fileResult.output = lintResult.output
          fileResult.success = fileResult.success && lintResult.success

          if (lintResult.message) {
            reportResult.push({
              name: linterWorker.name,
              success: lintResult.success,
              output: lintResult.message
            })
          }
        }

        const isModified = fileResult.output !== fileResult.fileContent

        if (isModified) {
          if (fix) {
            try {
              fs.writeFileSync(fileResult.filePath, fileResult.output, {
                encoding: 'utf-8'
              })
            } catch {
              reportResult.push({
                name: 'elint',
                success: false,
                output: `${chalk.underline(filePath)}\n  ${chalk.red(
                  'error:'
                )} This file can not be written\n\n`
              })
              // empty
            }
          } else if (format) {
            fileResult.success = fileResult.success && isModified

            reportResult.push({
              name: 'elint - formatter',
              success: false,
              output: `${chalk.underline(
                fileResult.filePath
              )}\n  ${chalk.red.bold('!')} Not formatted\n\n`
            })
          }
        }

        if (success && !fileResult.success) {
          success = false
        }
      }

      tasks.push(task())
    })
  }

  await Promise.all(tasks)

  if (activateTypeWorkerGroup['after-all']) {
    for (const worker of activateTypeWorkerGroup['after-all']) {
      if (worker.activateConfig.activate?.(workerActivateBaseOption)) {
        const result = await worker.execute('', { cwd })

        success = success && result.success

        reportResult.push({
          name: worker.name,
          success: result.success,
          output: result.message || ''
        })
      }
    }
  }

  return {
    success,
    message: report(reportResult)
  }
}

export default elint
