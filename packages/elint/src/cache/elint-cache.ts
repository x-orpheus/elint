import _debug from 'debug'
import fileEntryCache, { type FileEntryCache } from 'file-entry-cache'
import type {
  ElintOptions,
  ElintResult,
  InternalLoadedPresetAndPlugins
} from '../types.js'

const debug = _debug('elint:cache')

export type ElintCacheOptions = Required<
  Pick<ElintOptions, 'fix' | 'internalLoadedPrestAndPlugins' | 'write'>
>

export type ElintCachePresetString = `${string}@${string}`

class ElintCache {
  cacheFilePath?: string

  fileEntryCache: FileEntryCache

  constructor(cacheFilePath: string) {
    this.cacheFilePath = cacheFilePath

    debug(`Initial cache in ${cacheFilePath}`)

    this.fileEntryCache = fileEntryCache.create(cacheFilePath)
  }

  static getPresetString(
    internalLoadedPrestAndPlugins: InternalLoadedPresetAndPlugins
  ): ElintCachePresetString {
    return `${internalLoadedPrestAndPlugins.internalPreset.name}@${internalLoadedPrestAndPlugins.internalPreset.version}`
  }

  getFileCache(
    filePath: string,
    { internalLoadedPrestAndPlugins }: ElintCacheOptions
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
    const cachePresetString: ElintCachePresetString = (fileDescriptor as any)
      .meta?.presetString

    if (!cachePresetString) {
      debug(`Cache missed: ${filePath}`)

      return false
    }

    if (
      cachePresetString !==
      ElintCache.getPresetString(internalLoadedPrestAndPlugins)
    ) {
      debug(`Preset changed: ${filePath}`)

      return false
    }

    debug(`Skipping file since it hasn't changed: ${filePath}`)

    return true
  }

  setFileCache(
    result: ElintResult,
    { fix, internalLoadedPrestAndPlugins, write }: ElintCacheOptions
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

      if (!success) {
        this.fileEntryCache.removeEntry(filePath)
        debug(`Removing cache result: ${filePath}`)

        return
      }

      debug(`Updating cache result: ${filePath}`)

      const cachePresetString: ElintCachePresetString =
        ElintCache.getPresetString(internalLoadedPrestAndPlugins)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(fileDescriptor as any).meta.presetString = cachePresetString
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
