import _debug from 'debug'
import fs from 'fs-extra'
import chalk from 'chalk'
import walker from './walker'
import report, { ReportResult } from './utils/report'
import isGitHooks from './utils/is-git-hooks'
import { elintWorkerEsLint } from './workers-new/eslint'
import { elintWorkerPrettier } from './workers-new/prettier'
import type { ElintWorkerName } from './workers-new/worker'
// const notifier = require('./notifier')

const debug = _debug('elint:main')

export interface FileResult {
  filePath: string
  fileContent: string
  output: string
  success: boolean
}

export interface ElintOptions {
  fix?: boolean
  prettier?: boolean
}

/**
 * 主函数
 *
 * @param files 待执行 lint 的文件
 * @param options options
 * @returns
 */
async function elint(files: string[], options: ElintOptions) {
  const fileList = await walker(files, options)

  // 没有匹配到任何文件，直接退出
  if (!fileList.es.length && !fileList.style.length) {
    process.exit()
  }

  // 处理 fix
  const isGit = await isGitHooks()

  if (isGit) {
    options.fix = false
  }

  debug('parsed options: %o', options)

  const { fix = false, prettier = false } = options

  const cwd = process.cwd()

  const tasks: Promise<void>[] = []

  let success = true
  const outputs: ReportResult[] = []

  fileList.es.forEach((filePath) => {
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
        } catch {
          return
        }
      } else {
        fileResult.filePath = filePath.fileName
        fileResult.fileContent = filePath.fileContent
      }

      if (typeof fileResult.fileContent !== 'string') {
        return
      }

      fileResult.output = fileResult.fileContent

      let formatterName: ElintWorkerName | undefined

      if (prettier) {
        const formatterResult = await elintWorkerPrettier.executeOnText(
          fileResult.output,
          { cwd, filePath: fileResult.filePath }
        )

        fileResult.output = formatterResult.output

        formatterName = formatterResult.worker.name

        if (!fix) {
          fileResult.success &&= formatterResult.success
        }

        if (formatterResult.message) {
          outputs.push({
            name: formatterResult.worker.name,
            success: formatterResult.success,
            output: formatterResult.message
          })
        }
      }

      const lintResult = await elintWorkerEsLint.executeOnText(
        fileResult.output,
        { cwd, fix, filePath: fileResult.filePath }
      )

      fileResult.output = lintResult.output

      fileResult.success &&= lintResult.success

      if (lintResult.message) {
        outputs.push({
          name: lintResult.worker.name,
          success: lintResult.success,
          output: lintResult.message
        })
      }

      const isModified = fileResult.output !== fileResult.fileContent

      if (isModified) {
        if (fix) {
          try {
            fs.writeFileSync(fileResult.filePath, fileResult.output, {
              encoding: 'utf-8'
            })
          } catch {
            // empty
          }
        } else if (prettier) {
          fileResult.success &&= isModified

          if (formatterName) {
            outputs.push({
              name: formatterName,
              success: false,
              output: `${chalk.underline(
                fileResult.filePath
              )}\n   ${chalk.yellow.bold('!')} Not formatted\n\n`
            })
          }
        }
      }

      if (success && !fileResult.success) {
        success = false
      }
    }

    tasks.push(task())
  })

  await Promise.all(tasks)

  console.log(report(outputs))

  process.exit(success ? 0 : 1)
}

export default elint
