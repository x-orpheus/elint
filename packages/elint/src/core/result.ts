import type { ElintResult } from '../types.js'

export function createElintResult<T>(
  config?: Partial<ElintResult<T>>
): ElintResult<T> {
  return {
    source: '',
    output: '',
    filePath: '',
    isBinary: false,
    fromCache: false,
    errorCount: 0,
    warningCount: 0,
    pluginResults: [],
    ...config
  }
}
