import fs from 'fs-extra'
import path from 'path'
import ElintCache from './elint-cache.js'

let elintCache: ElintCache | undefined

const ELINT_CACHE_FILENAME = '.elintcache'

interface ElintCacheLocationOptions {
  cwd: string
  cacheLocation?: string
}

function getElintCachePath({
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
    location = path.join(location, ELINT_CACHE_FILENAME)
  }

  return location
}

export function getElintCache(
  cache: boolean,
  cacheLocationOptions: ElintCacheLocationOptions
): ElintCache | undefined {
  if (!cache) {
    return undefined
  }

  if (!elintCache) {
    elintCache = new ElintCache(getElintCachePath(cacheLocationOptions))
  }

  return elintCache
}

export function resetElintCache(
  cacheLocationOptions: ElintCacheLocationOptions
): void {
  const elintCache = getElintCache(true, cacheLocationOptions)

  elintCache?.delete()
}
