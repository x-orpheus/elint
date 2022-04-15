import fs from 'fs-extra'
import path from 'path'
import ElintCache from './elint-cache.js'

let elintCache: ElintCache | undefined

function getElintCacheFilePath(cwd: string): string {
  let cacheFilePath = path.join(cwd, 'node_modules')

  if (fs.existsSync(cacheFilePath)) {
    cacheFilePath = path.join(cacheFilePath, '.cache')
  } else {
    cacheFilePath = path.join(cwd, '.cache')
  }

  return path.join(cacheFilePath, 'elint')
}

export function getElintCache(
  cache = false,
  cwd: string
): ElintCache | undefined {
  if (!cache) {
    return undefined
  }

  if (!elintCache) {
    elintCache = new ElintCache(getElintCacheFilePath(cwd))
  }

  return elintCache
}

export function resetElintCache(cwd: string): void {
  const elintCache = getElintCache(true, cwd)

  elintCache?.delete()
}
