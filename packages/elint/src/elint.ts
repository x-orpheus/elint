import _debug from 'debug'
import fs from 'fs-extra'
import { groupBy } from 'lodash-es'
import walker from './walker/index.js'
import { loadElintPlugins } from './plugin/load.js'
import { executeElintPlugin } from './plugin/execute.js'
import type {
  ElintPluginOptions,
  ElintPluginOverridableKey
} from './plugin/types.js'
import { getBaseDir } from './env.js'
import type { InternalPreset } from './preset/types.js'
import { loadElintPreset, tryLoadElintPreset } from './preset/load.js'
import type {
  ElintBasicOptions,
  InternalLoadedPresetAndPlugins,
  ElintOptions,
  ElintResult
} from './types.js'
import log from './utils/log.js'
import { getElintCache, resetElintCache } from './cache/index.js'
import formatChecker from './plugin/built-in/format-checker.js'
import { PRESET_PATTERN } from './config.js'

const debug = _debug('elint:main')

export function createElintResult<T>(
  config?: Partial<ElintResult<T>>
): ElintResult<T> {
  return {
    source: '',
    output: '',
    errorCount: 0,
    warningCount: 0,
    pluginResults: [],
    ...config
  }
}

/**
 * 加载 preset 和 plugins
 */
export async function loadPresetAndPlugins({
  preset,
  cwd = getBaseDir()
}: Pick<
  ElintBasicOptions,
  'preset' | 'cwd'
> = {}): Promise<InternalLoadedPresetAndPlugins> {
  let internalPreset: InternalPreset

  if (preset) {
    debug(`start load preset: ${preset}`)

    internalPreset = await loadElintPreset(preset, { cwd })
  } else {
    debug('start load preset in node_modules')

    internalPreset = await tryLoadElintPreset(PRESET_PATTERN, { cwd })
  }

  const pendingPlugins = internalPreset.preset.plugins || []

  const internalPlugins = await loadElintPlugins(pendingPlugins, {
    cwd,
    presetPath: internalPreset.path
  })

  if (!internalPlugins.length) {
    throw new Error(
      `'${internalPreset.name}' doesn't contain available elint plugins`
    )
  }

  if (internalPreset.preset.overridePluginConfig) {
    const overridePluginConfig = internalPreset.preset.overridePluginConfig

    internalPlugins.forEach(({ plugin }) => {
      if (overridePluginConfig[plugin.name]) {
        Object.keys(overridePluginConfig[plugin.name]).forEach((key) => {
          debug(`overriding config of ${plugin.name}: ${key}`)

          const currentKey = key as ElintPluginOverridableKey
          const currentValue = overridePluginConfig[plugin.name][currentKey]

          /* istanbul ignore next */
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

  debug('loaded preset and plugins')

  return {
    internalPreset,
    internalPlugins,
    pluginGroup: groupBy(
      internalPlugins.map(({ plugin }) => plugin),
      (plugin) => plugin.type
    ) as InternalLoadedPresetAndPlugins['pluginGroup']
  }
}

/**
 * 执行全部 type 为 common 的 plugin
 */
export async function lintCommon({
  fix = false,
  preset,
  cwd = getBaseDir(),
  internalLoadedPresetAndPlugins
}: ElintBasicOptions = {}): Promise<ElintResult> {
  const elintResult = createElintResult()

  const { pluginGroup } =
    internalLoadedPresetAndPlugins ||
    (await loadPresetAndPlugins({ preset, cwd }))

  for (const commonPlugin of pluginGroup.common || []) {
    await executeElintPlugin(elintResult, commonPlugin, {
      fix,
      cwd,
      source: elintResult.source
    })
  }

  return elintResult
}

export async function lintText(
  text: string,
  {
    fix = false,
    preset,
    cwd = getBaseDir(),
    filePath,
    internalLoadedPresetAndPlugins
  }: ElintBasicOptions & { filePath?: string } = {}
): Promise<ElintResult> {
  debug(`┌─ lint text ${filePath ? `(${filePath})` : ''} start`)
  const elintResult = createElintResult({
    filePath,
    source: text,
    output: text
  })

  const { pluginGroup } =
    internalLoadedPresetAndPlugins ||
    (await loadPresetAndPlugins({ preset, cwd }))

  const pluginOptions: ElintPluginOptions = {
    fix,
    cwd,
    filePath,
    source: elintResult.source
  }

  for (const formatterPlugin of pluginGroup.formatter || []) {
    await executeElintPlugin(elintResult, formatterPlugin, pluginOptions)
  }

  for (const linterPlugin of pluginGroup.linter || []) {
    await executeElintPlugin(elintResult, linterPlugin, {
      ...pluginOptions,
      fix
    })
  }

  if (pluginGroup.formatter?.length) {
    // 格式化检查
    await executeElintPlugin(elintResult, formatChecker, pluginOptions)
  }

  debug(`└─ lint text ${filePath ? `(${filePath})` : ''} finish`)

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
    noIgnore = false,
    git = false,
    preset,
    cwd = getBaseDir(),
    internalLoadedPresetAndPlugins,
    cache = false,
    cacheLocation
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

  if (!fileList.length) {
    return []
  }

  const elintResultList: ElintResult[] = []

  const currentInternalLoadedPresetAndPlugins =
    internalLoadedPresetAndPlugins ||
    (await loadPresetAndPlugins({ preset, cwd }))

  const tasks: (() => Promise<void>)[] = []

  const elintCache = cache ? getElintCache({ cwd, cacheLocation }) : undefined

  fileList.forEach((fileItem) => {
    const task = async (): Promise<void> => {
      let source: string
      let filePath: string
      /**
       * 在 git 缓存区获取文件内容的情况下跳过缓存
       */
      let skipCache = false

      if (typeof fileItem === 'string') {
        filePath = fileItem
        source = fs.readFileSync(fileItem, 'utf-8')
      } else {
        filePath = fileItem.filePath
        source = fileItem.fileContent
        skipCache = true
      }

      let elintResult = createElintResult({
        filePath,
        source,
        output: source
      })

      if (!skipCache) {
        const cacheResult = elintCache?.getFileCache(filePath, {
          fix,
          internalLoadedPresetAndPlugins: currentInternalLoadedPresetAndPlugins,
          write
        })

        if (cacheResult) {
          elintResult.fromCache = true
          elintResultList.push(elintResult)
          return
        }
      }

      elintResult = await lintText(elintResult.source, {
        fix,
        cwd,
        filePath: elintResult.filePath,
        internalLoadedPresetAndPlugins: currentInternalLoadedPresetAndPlugins
      })

      const isModified = elintResult.output !== elintResult.source

      if (isModified && fix && write && elintResult.filePath) {
        fs.writeFileSync(elintResult.filePath, elintResult.output, {
          encoding: 'utf-8'
        })
      }

      if (!skipCache) {
        elintCache?.setFileCache(elintResult, {
          fix,
          internalLoadedPresetAndPlugins: currentInternalLoadedPresetAndPlugins,
          write
        })
      }

      elintResultList.push(elintResult)
    }

    tasks.push(task)
  })

  debug('elint tasks start')

  for (const task of tasks) {
    await task()
  }

  debug('elint task end')

  elintCache?.reconcile()

  debug(`elint lint files in: ${Date.now() - startTime}ms`)

  return elintResultList
}

export async function reset({
  preset,
  cwd = getBaseDir(),
  cacheLocation,
  internalLoadedPresetAndPlugins
}: ElintOptions = {}): Promise<Record<string, unknown>> {
  const { internalPlugins } =
    internalLoadedPresetAndPlugins ||
    (await loadPresetAndPlugins({ preset, cwd }))

  const errorMap: Record<string, unknown> = {}

  resetElintCache({ cwd, cacheLocation })

  for (const internalPlugin of internalPlugins) {
    try {
      await internalPlugin.plugin.reset?.()
    } catch (e) {
      errorMap[internalPlugin.name] = e
      debug(`elint plugin ${internalPlugin.name} reset error %o`, e)
    }
  }

  return errorMap
}
