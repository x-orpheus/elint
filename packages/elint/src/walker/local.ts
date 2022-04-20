import { globby } from 'globby'

/**
 * 本地文件遍历
 *
 * @param [patterns] 匹配模式
 * @param [ignorePatterns] 忽略模式
 *
 * @returns file list
 */
export default function walker(
  patterns: string[],
  ignorePatterns: string[] = [],
  cwd: string
): Promise<string[]> {
  return globby(patterns, {
    cwd,
    gitignore: true,
    ignore: ignorePatterns,
    dot: true,
    onlyFiles: true,
    absolute: true
  })
}
