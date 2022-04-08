import _debug from 'debug'
import fs from 'fs-extra'
import chalk from 'chalk'
import { groupBy } from 'lodash-es'
import walker from './walker/index.js'
import { createErrorReportResult, ReportResult } from './utils/report.js'
import { loadElintPlugins } from './plugin/load.js'
import { executeElintPlugin } from './plugin/execute.js'
import {
  ElintPlugin,
  ElintPluginOptions,
  ElintPluginOverridableKey,
  ElintPluginResult,
  ElintPluginType
} from './plugin/types.js'
import { getBaseDir } from './env.js'
import { ElintPreset, InternalElintPreset } from './preset/types.js'
import { loadElintPreset, tryLoadElintPreset } from './preset/load.js'

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

export interface ElintLoadedPresetAndPlugins {
  internalPreset?: InternalElintPreset
  loadedPlugins: ElintPlugin<unknown>[]
  loadedPluginGroup: Record<ElintPluginType, ElintPlugin<unknown>[]>
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

export interface ElintContext {
  cwd: string
  presetPath?: string
}

export async function loadPresetAndPlugins({
  preset,
  plugins,
  cwd = getBaseDir()
}: Pick<
  ElintBasicOptions,
  'preset' | 'plugins' | 'cwd'
> = {}): Promise<ElintLoadedPresetAndPlugins> {
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

  if (internalPreset?.preset.overridePluginConfig) {
    const overridePluginConfig = internalPreset.preset.overridePluginConfig

    loadedPlugins.forEach((plugin) => {
      if (overridePluginConfig[plugin.id]) {
        Object.entries(overridePluginConfig[plugin.id]).forEach(
          ([key, value]) => {
            if (['activateConfig'].includes(key)) {
              const overridableKey = key as ElintPluginOverridableKey
              plugin[overridableKey] = value
            }
          }
        )
      }
    })
  }

  return {
    internalPreset,
    loadedPlugins,
    loadedPluginGroup: groupBy(
      loadedPlugins,
      (plugin) => plugin.type
    ) as Record<ElintPluginType, ElintPlugin<unknown>[]>
  }
}

export async function lintCommon({
  fix = false,
  preset,
  plugins,
  cwd = getBaseDir(),
  loadedPrestAndPlugins
}: ElintBasicOptions = {}): Promise<ElintResult> {
  const elintResult: ElintResult = {
    source: '',
    output: '',
    success: true,
    reportResults: [],
    pluginResults: []
  }

  const { loadedPlugins, loadedPluginGroup } =
    loadedPrestAndPlugins ||
    (await loadPresetAndPlugins({ preset, plugins, cwd }))

  if (!loadedPlugins.length) {
    return elintResult
  }

  const pluginOptions: ElintPluginOptions = {
    fix,
    cwd
  }

  if (loadedPluginGroup.common) {
    for (const commonPlugin of loadedPluginGroup.common) {
      const executeResult = await executeElintPlugin(
        commonPlugin,
        '',
        pluginOptions
      )

      elintResult.success = elintResult.success && executeResult.success

      if (executeResult.pluginResult) {
        elintResult.pluginResults.push(executeResult.pluginResult)
      }

      if (executeResult.reportResult) {
        elintResult.reportResults.push(executeResult.reportResult)
      }
    }
  }

  return elintResult
}

export async function lintText(
  text: string,
  {
    fix = false,
    style = false,
    preset,
    plugins,
    cwd = getBaseDir(),
    filePath,
    loadedPrestAndPlugins
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

  const { loadedPlugins, loadedPluginGroup } =
    loadedPrestAndPlugins ||
    (await loadPresetAndPlugins({ preset, plugins, cwd }))

  if (!loadedPlugins.length) {
    return elintResult
  }

  const pluginOptions: ElintPluginOptions = {
    fix,
    cwd,
    filePath
  }

  if (style && loadedPluginGroup.formatter) {
    for (const formatterPlugin of loadedPluginGroup.formatter) {
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

  if (loadedPluginGroup.linter) {
    for (const linterPlugin of loadedPluginGroup.linter) {
      const executeResult = await executeElintPlugin(
        linterPlugin,
        elintResult.output,
        {
          ...pluginOptions,
          // 当需要格式化时，lint 将执行 fix 操作
          fix: style || fix
        }
      )

      elintResult.success = elintResult.success && executeResult.success

      if (executeResult.pluginResult) {
        elintResult.output = executeResult.pluginResult.output
        elintResult.pluginResults.push(executeResult.pluginResult)
      }

      if (executeResult.reportResult) {
        elintResult.reportResults.push(executeResult.reportResult)
      }
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
    cwd = getBaseDir(),
    loadedPrestAndPlugins
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

  // 没有匹配到任何文件进行提示
  if (!fileList.length) {
    return elintResultList.concat({
      success: true,
      source: '',
      output: '',
      reportResults: [
        createErrorReportResult(
          'elint',
          undefined,
          undefined,
          `${chalk.yellow('Warning: no file is matched')}`
        )
      ],
      pluginResults: []
    })
  }

  const { loadedPlugins } =
    loadedPrestAndPlugins ||
    (await loadPresetAndPlugins({ preset, plugins, cwd }))

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
          filePath: elintResult.filePath,
          loadedPrestAndPlugins
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

export async function reset({
  preset,
  plugins,
  cwd = getBaseDir(),
  loadedPrestAndPlugins
}: ElintBasicOptions = {}): Promise<Record<string, unknown>> {
  const { loadedPlugins } =
    loadedPrestAndPlugins ||
    (await loadPresetAndPlugins({ preset, plugins, cwd }))

  const errorMap: Record<string, unknown> = {}

  if (!loadedPlugins.length) {
    return {}
  }

  for (const plugin of loadedPlugins) {
    try {
      await plugin.reset?.()
    } catch (e) {
      errorMap[plugin.id] = e
      debug(`elint plugin ${plugin.id} reset error %o`, e)
    }
  }

  return errorMap
}
