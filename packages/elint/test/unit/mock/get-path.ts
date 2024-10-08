import path from 'node:path'
import normalize from 'normalize-path'
import { getBaseDir } from '../../../src/env.js'

function getPath(relativePath: string): string {
  const baseDir = getBaseDir()

  return normalize(path.join(baseDir, relativePath))
}

export default getPath
