import fs from 'fs-extra'
import path from 'path'
import ElintCache from './elint-cache.js'

let elintCache: ElintCache | undefined

const ELINT_CACHE_FILENAME = '.elintcache'

export function getElintCacheLocation(cwd: string): string {
  let cacheLocation = path.join(cwd, 'node_modules')

  if (fs.existsSync(cacheLocation)) {
    cacheLocation = path.join(cacheLocation, '.cache')
  } else {
    cacheLocation = path.join(cwd, '.cache')
  }

  return cacheLocation
}

export function getElintCache(
  cache: boolean,
  cacheLocation: string
): ElintCache | undefined {
  if (!cache) {
    return undefined
  }

  if (!elintCache) {
    elintCache = new ElintCache(path.join(cacheLocation, ELINT_CACHE_FILENAME))
  }

  return elintCache
}

export function resetElintCache(cacheLocation: string): void {
  const elintCache = getElintCache(
    true,
    path.join(cacheLocation, ELINT_CACHE_FILENAME)
  )

  elintCache?.delete()
}
