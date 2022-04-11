import fs from 'fs-extra'
import path from 'path'
import ElintCache from './elint-cache.js'

let elintCache: ElintCache | undefined

// cache 只缓存什么问题都没有的文件，如果文件存在 warning 或者 error 都不进行缓存

function getElintCache(cache = false, cwd: string): ElintCache | undefined {
  if (!cache) {
    return undefined
  }

  if (!elintCache) {
    let cacheFilePath = path.join(cwd, 'node_modules')

    if (fs.existsSync(cacheFilePath)) {
      cacheFilePath = path.join(cacheFilePath, '.cache')
    } else {
      cacheFilePath = path.join(cwd, '.cache')
    }

    elintCache = new ElintCache(cacheFilePath)
  }

  return elintCache
}

export default getElintCache
