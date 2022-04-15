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
  /**
   * 是否完全成功（没有 warning 和 error）
   */
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

    this.fileEntryCache = fileEntryCache.create(cacheFilePath)
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

    if (!cacheMetaResult || !cacheMetaResult.success) {
      debug(`Cache missed: ${filePath}`)

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
      return
    }

    const fileDescriptor = this.fileEntryCache.getFileDescriptor(filePath)

    if (!fileDescriptor.notFound) {
      let success = !result.errorCount && !result.warningCount

      // fix 且不写入文件时的结果不缓存
      if (fix && !write) {
        success = false
      }

      debug(`Updating cache result: ${filePath}, success: ${success}`)

      const cacheMetaResult: CacheMetaResult = {
        success,
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
