import _debug from 'debug'
import fs from 'fs-extra'
import { isBinaryFileSync } from 'isbinaryfile'
import walker from './walker/index.js'
import { executeElintPlugin } from './plugin/execute.js'
import { ElintPluginType, type ElintPluginOptions } from './plugin/types.js'
import { getBaseDir } from './env.js'
import type {
  ElintBasicOptions,
  ElintLintTextOptions,
  ElintOptions,
  ElintResult
} from './types.js'
import { getElintCache } from './cache/index.js'
import formatChecker from './plugin/built-in/format-checker.js'
import { createElintResult } from './core/result.js'
import { loadPresetAndPlugins } from './core/load.js'

const debug = _debug('elint:main')

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

  const { internalPlugins } =
    internalLoadedPresetAndPlugins ||
    (await loadPresetAndPlugins({ preset, cwd }))

  const commonInternalPlugins = internalPlugins.filter(
    ({ plugin }) => plugin.type <= 0
  )

  for (const { plugin: commonPlugin } of commonInternalPlugins || []) {
    await executeElintPlugin(elintResult, commonPlugin, {
      fix,
      cwd,
      source: elintResult.source,
      isBinary: elintResult.isBinary
    })
  }

  return elintResult
}

export async function lintText(
  text: string,
  {
    filePath,
    isBinary,
    fix = false,
    preset,
    cwd = getBaseDir(),
    internalLoadedPresetAndPlugins
  }: ElintLintTextOptions = {}
): Promise<ElintResult> {
  debug(`┌─ lint text ${filePath ? `(${filePath})` : ''} start`)
  const elintResult = createElintResult({
    filePath,
    source: text,
    output: text,
    isBinary
  })

  const { internalPlugins } =
    internalLoadedPresetAndPlugins ||
    (await loadPresetAndPlugins({ preset, cwd }))

  const pluginOptions: ElintPluginOptions = {
    fix,
    cwd,
    filePath,
    source: elintResult.source,
    isBinary
  }

  let needFormatChecker = false

  const textInternalPlugins = internalPlugins.filter(
    ({ plugin }) => plugin.type > 0
  )

  for (const { plugin } of textInternalPlugins || []) {
    await executeElintPlugin(elintResult, plugin, pluginOptions)

    if (plugin.needFormatChecker || plugin.type === ElintPluginType.Formatter) {
      needFormatChecker = true
    }
  }

  if (needFormatChecker) {
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
      let source = ''
      let filePath: string
      /**
       * 在 git 缓存区获取文件内容的情况下跳过缓存
       */
      let skipCache = false

      let isBinary = false

      if (typeof fileItem === 'string') {
        filePath = fileItem

        if (isBinaryFileSync(filePath)) {
          isBinary = true
        } else {
          source = fs.readFileSync(fileItem, 'utf-8')
        }
      } else {
        filePath = fileItem.filePath
        source = fileItem.fileContent
        skipCache = true
      }

      let elintResult = createElintResult({
        filePath,
        source,
        output: source,
        isBinary
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
        filePath: elintResult.filePath,
        isBinary,
        fix,
        cwd,
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
