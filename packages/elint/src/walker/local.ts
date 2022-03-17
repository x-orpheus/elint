import { globby } from 'globby'
import { getBaseDir } from '../env'

/**
 * 本地文件遍历
 *
 * @param [patterns] 匹配模式
 * @param [ignorePatterns] 忽略模式
 *
 * @returns file list
 */
export default function walker(
  patterns: string[] = [],
  ignorePatterns: string[] = []
): Promise<string[]> {
  const baseDir = getBaseDir()

  return globby(patterns, {
    cwd: baseDir,
    gitignore: true,
    ignore: ignorePatterns,
    dot: true,
    onlyFiles: true,
    absolute: false
  })
}
