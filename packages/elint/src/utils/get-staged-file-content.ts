import _debug from 'debug'
import { execa } from 'execa'

const debug = _debug('elint:utils:get-staged-file-content')

/**
 * 获取暂存区文件内容
 *
 * @param filePath 文件路径
 * @returns 文件内容
 */
async function getStagedFileContent(
  filePath: string,
  cwd?: string
): Promise<string | null> {
  try {
    const { stdout } = await execa('git', ['show', `:${filePath}`], {
      cwd,
      stripFinalNewline: false
    })
    return stdout
  } catch (error) {
    debug('%O', error)
    return null
  }
}

export default getStagedFileContent
