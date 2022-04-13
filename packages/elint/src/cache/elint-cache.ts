import _debug from 'debug'
import fileEntryCache, { type FileEntryCache } from 'file-entry-cache'
import type { ElintOptions, ElintResult } from '../types.js'

const debug = _debug('elint:cache')

export type ElintCacheOptions = Required<
  Pick<
    ElintOptions,
    'fix' | 'style' | 'internalLoadedPrestAndPlugins' | 'write'
  >
>

interface CacheMetaResult {
  success: boolean
  style: boolean
  // 扁平结构会减少缓存文件存储量
  presetName: string
  presetVersion: string
}

class ElintCache {
  cacheFilePath?: string

  fileEntryCache: FileEntryCache

  constructor(cacheFilePath: string) {
    this.cacheFilePath = cacheFilePath

    debug(`Initial cache in ${cacheFilePath}`)

    this.fileEntryCache = fileEntryCache.create('elint', cacheFilePath)
  }

  getFileCache(
    filePath: string,
    { style, internalLoadedPrestAndPlugins }: ElintCacheOptions
  ): boolean {
    const fileDescriptor = this.fileEntryCache.getFileDescriptor(filePath)

    if (fileDescriptor.notFound) {
      debug(`File not found: ${filePath}`)
      return false
    }

    if (fileDescriptor.changed) {
      debug(`File changed: ${filePath}`)
      return false
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cacheMetaResult: CacheMetaResult = (fileDescriptor as any).meta
      ?.result

    if (!cacheMetaResult) {
      debug(`Cache touched without data: ${filePath}`)

      return false
    }

    if (cacheMetaResult.style !== style) {
      debug(
        `Cache style changed(before=${cacheMetaResult.style}, after=${style}): ${filePath}`
      )

      return false
    }

    if (
      cacheMetaResult.presetName !==
        internalLoadedPrestAndPlugins.internalPreset.name ||
      cacheMetaResult.presetVersion !==
        internalLoadedPrestAndPlugins.internalPreset.version
    ) {
      debug(`Preset changed: ${filePath}`)

      return false
    }

    debug(`Skipping file since it hasn't changed: ${filePath}`)

    return true
  }

  setFileCache(
    result: ElintResult,
    { fix, style, internalLoadedPrestAndPlugins, write }: ElintCacheOptions
  ) {
    const filePath = result.filePath

    if (!filePath) {
      debug('Ignore updating cache without filePath')

      return
    }

    // fix 模式下不写入的不缓存
    if (fix && !write) {
      debug(
        `Ignore updating cache result with fix=true && write=false: ${filePath}`
      )

      return
    }

    // 结果错误或者有 warning 消息的不缓存
    if (!result.success || result.reportResults.length) {
      debug(`Ignore updating cache result with warning or error: ${filePath}`)

      return
    }

    const fileDescriptor = this.fileEntryCache.getFileDescriptor(filePath)

    if (!fileDescriptor.notFound) {
      debug(`Updating cache result: ${filePath}`)

      const cacheMetaResult: CacheMetaResult = {
        success: true,
        style,
        presetName: internalLoadedPrestAndPlugins.internalPreset.name,
        presetVersion: internalLoadedPrestAndPlugins.internalPreset.version
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(fileDescriptor as any).meta.result = cacheMetaResult
    }
  }

  reconcile() {
    debug(`Cache saved to ${this.cacheFilePath}`)
    this.fileEntryCache.reconcile()
  }

  delete() {
    debug('Cache deleted.')
    this.fileEntryCache.deleteCacheFile()
  }
}

export default ElintCache
