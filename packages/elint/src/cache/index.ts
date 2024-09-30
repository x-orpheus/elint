import fs from 'fs-extra'
import path from 'node:path'
import { CACHE_FILENAME } from '../config.js'
import ElintCache from './elint-cache.js'

let elintCache: ElintCache | undefined

export interface ElintCacheLocationOptions {
  cwd: string
  cacheLocation?: string
}

export function getElintCachePath({
  cwd,
  cacheLocation
}: ElintCacheLocationOptions): string {
  let location = cacheLocation

  if (!location) {
    location = path.join(cwd, 'node_modules', '/')

    if (fs.existsSync(location)) {
      location = path.join(location, '.cache', '/')
    } else {
      location = path.join(cwd, '.cache', '/')
    }
  } else {
    if (!path.isAbsolute(location)) {
      location = path.join(cwd, location)
    }
  }

  if (location.slice(-1) === path.sep) {
    location = path.join(location, CACHE_FILENAME)
  }

  return location
}

export function getElintCache(
  cacheLocationOptions: ElintCacheLocationOptions
): ElintCache {
  if (!elintCache) {
    elintCache = new ElintCache(getElintCachePath(cacheLocationOptions))
  }

  return elintCache
}

export function resetElintCache(
  cacheLocationOptions: ElintCacheLocationOptions
): void {
  const elintCache = getElintCache(cacheLocationOptions)

  elintCache.delete()
}
