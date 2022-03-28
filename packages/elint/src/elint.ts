import _debug from 'debug'
import fs from 'fs-extra'
import chalk from 'chalk'
import walker from './walker'
import { createErrorReportResult, ReportResult } from './utils/report'
import { groupElintPluginsByType, loadElintPlugins } from './plugin/load'
import { executeElintPlugin } from './plugin/execute'
import {
  ElintPlugin,
  ElintPluginOptions,
  ElintPluginResult
} from './plugin/types'
import { getBaseDir } from './env'
import { ElintPreset, InternalElintPreset } from './preset/types'
import { loadElintPreset, tryLoadElintPreset } from './preset/load'

const debug = _debug('elint:main')

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
   * 输出格式化结果
   */
  reportResults: ReportResult[]
  /**
   * 各个 plugin 结果
   */
  pluginResults: ElintPluginResult<unknown>[]
}

interface ElintBasicOptions {
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

export interface ElintContext {
  cwd: string
  presetPath?: string
}

export async function loadPresetAndPlugins({
  preset,
  plugins,
  cwd = getBaseDir()
}: Pick<ElintBasicOptions, 'preset' | 'plugins' | 'cwd'>): Promise<{
  internalPreset?: InternalElintPreset
  loadedPlugins: ElintPlugin<unknown>[]
}> {
  if (preset && plugins) {
    throw new Error('Can not specify preset and plugins at same time')
  }

  let internalPreset: InternalElintPreset | undefined

  if (preset) {
    internalPreset = await loadElintPreset(preset, { cwd })
  } else if (!plugins) {
    internalPreset = await tryLoadElintPreset({ cwd })
  }

  const pendingPlugins = internalPreset?.preset.plugins || plugins || []

  const loadedPlugins = await loadElintPlugins(pendingPlugins, {
    cwd,
    presetPath: internalPreset?.path
  })

  return {
    internalPreset,
    loadedPlugins
  }
}

export async function lintText(
  text: string,
  {
    fix = false,
    style = false,
    preset,
    plugins,
    cwd = getBaseDir(),
    filePath
  }: ElintBasicOptions & { filePath?: string } = {}
): Promise<ElintResult> {
  const elintResult: ElintResult = {
    filePath,
    source: text,
    output: text,
    success: true,
    reportResults: [],
    pluginResults: []
  }

  const { loadedPlugins } = await loadPresetAndPlugins({ preset, plugins, cwd })

  if (!loadedPlugins.length) {
    return elintResult
  }

  const pluginOptions: ElintPluginOptions = {
    fix,
    cwd,
    filePath
  }

  const pluginGroup = groupElintPluginsByType(loadedPlugins)

  if (style) {
    for (const formatterPlugin of pluginGroup.formatter) {
      const executeResult = await executeElintPlugin(
        formatterPlugin,
        elintResult.output,
        pluginOptions
      )

      if (executeResult.pluginResult) {
        elintResult.output = executeResult.pluginResult.output
        elintResult.pluginResults.push(executeResult.pluginResult)
      }

      if (executeResult.reportResult) {
        elintResult.reportResults.push(executeResult.reportResult)
      }
    }
  }

  for (const linterPlugin of pluginGroup.linter) {
    const executeResult = await executeElintPlugin(
      linterPlugin,
      elintResult.output,
      pluginOptions
    )

    elintResult.success &&= executeResult.success

    if (executeResult.pluginResult) {
      elintResult.output = executeResult.pluginResult.output
      elintResult.pluginResults.push(executeResult.pluginResult)
    }

    if (executeResult.reportResult) {
      elintResult.reportResults.push(executeResult.reportResult)
    }
  }

  const isModified = elintResult.output !== elintResult.source

  if (style && isModified && !fix) {
    elintResult.success = false
    elintResult.reportResults.push(
      createErrorReportResult(
        'elint - formatter',
        filePath,
        undefined,
        `${chalk.red.bold('!')} Not formatted`
      )
    )
  }

  return elintResult
}

/**
 * 格式化文件
 *
 * @param files 待执行 lint 的文件
 */
export async function lintFiles(
  files: string[],
  {
    fix: optionFix = false,
    write = true,
    style = false,
    noIgnore = false,
    git = false,
    preset,
    plugins,
    cwd = getBaseDir()
  }: ElintOptions
): Promise<ElintResult[]> {
  const startTime = Date.now()

  // 调整 fix 配置
  const fix = git ? false : optionFix

  const fileList = await walker(files, {
    noIgnore,
    git,
    cwd
  })

  const elintResultList: ElintResult[] = []

  // 没有匹配到任何文件直接退出
  if (!fileList.length) {
    return elintResultList
  }

  const { loadedPlugins } = await loadPresetAndPlugins({ preset, plugins, cwd })

  if (!loadedPlugins.length) {
    throw new Error('no available elint plugin')
  }

  const tasks: Promise<void>[] = []

  fileList.forEach((fileItem) => {
    const task = async (): Promise<void> => {
      let elintResult: ElintResult = {
        filePath: undefined,
        source: '',
        output: '',
        success: true,
        reportResults: [],
        pluginResults: []
      }

      try {
        if (typeof fileItem === 'string') {
          elintResult.filePath = fileItem
          elintResult.source = fs.readFileSync(fileItem, 'utf-8')
        } else {
          elintResult.filePath = fileItem.filePath
          elintResult.source = fileItem.fileContent
        }

        elintResult.output = elintResult.source

        elintResult = await lintText(elintResult.source, {
          fix,
          style,
          plugins: loadedPlugins,
          cwd,
          filePath: elintResult.filePath
        })

        const isModified = elintResult.output !== elintResult.source

        if (isModified && fix && write && elintResult.filePath) {
          fs.writeFileSync(elintResult.filePath, elintResult.output, {
            encoding: 'utf-8'
          })
        }
      } catch (e) {
        elintResult.success = false
        elintResult.reportResults.push(
          createErrorReportResult('elint', elintResult.filePath, e)
        )

        debug(`[${fileItem}] error: ${e}`)
      }

      elintResultList.push(elintResult)
    }

    tasks.push(task())
  })

  await Promise.all(tasks)

  debug(`elint complete in: ${Date.now() - startTime}ms`)

  return elintResultList
}
