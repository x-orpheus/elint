import _debug from 'debug'
import fs from 'fs-extra'
import chalk from 'chalk'
import { groupBy } from 'lodash-es'
import walker from './walker/index.js'
import { createErrorReportResult } from './utils/report.js'
import { loadElintPlugins } from './plugin/load.js'
import { executeElintPlugin } from './plugin/execute.js'
import type {
  ElintPlugin,
  ElintPluginOptions,
  ElintPluginOverridableKey,
  ElintPluginType
} from './plugin/types.js'
import { getBaseDir } from './env.js'
import type { InternalPreset } from './preset/types.js'
import { loadElintPreset, tryLoadElintPreset } from './preset/load.js'
import type {
  ElintBasicOptions,
  ElintLoadedPresetAndPlugins,
  ElintOptions,
  ElintResult
} from './types.js'
import log from './utils/log.js'

const debug = _debug('elint:main')

/**
 * 加载 preset 和 plugins
 */
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

  let internalPreset: InternalPreset | undefined

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
        Object.keys(overridePluginConfig[plugin.id]).forEach((key) => {
          const currentKey = key as ElintPluginOverridableKey
          const currentValue = overridePluginConfig[plugin.id][currentKey]
          if (
            !(['activateConfig'] as ElintPluginOverridableKey[]).includes(
              currentKey
            )
          ) {
            log.warn(`${currentKey} is not in ElintPluginOverridableKey`)
          }
          plugin[currentKey] = currentValue
        })
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

/**
 * 执行全部 type 为 common 的 plugin
 */
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
