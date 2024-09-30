import path from 'node:path'
import url from 'node:url'
import fs from 'node:fs/promises'

import ignoreModule from 'ignore'
import { isUrl, toPath, isUrlString } from 'url-or-path'

const createIgnore = ignoreModule.default

async function readFile(file: string | URL): Promise<undefined | string> {
  if (isUrlString(file)) {
    file = new URL(file)
  }

  try {
    return await fs.readFile(file, 'utf8')
  } catch (error) {
    const nodeError = error as NodeJS.ErrnoException
    if (nodeError.code === 'ENOENT') {
      return
    }

    throw new Error(`Unable to read '${file.toString()}': ${nodeError.message}`)
  }
}

const slash: (filePath: string) => string =
  path.sep === '\\'
    ? (filePath: string) => filePath.replaceAll('\\', '/')
    : (filePath: string) => filePath

function getRelativePath(
  file: string | URL,
  ignoreFile: string | URL | undefined
): string {
  const ignoreFilePath = toPath(ignoreFile || '')
  const filePath = isUrl(file) ? url.fileURLToPath(file) : path.resolve(file)

  return path.relative(
    // If there's an ignore-path set, the filename must be relative to the
    // ignore path, not the current working directory.
    ignoreFilePath ? path.dirname(ignoreFilePath) : process.cwd(),
    filePath
  )
}

async function createSingleIsIgnoredFunction(
  ignoreFile: string | URL | undefined,
  withNodeModules?: boolean
): Promise<((file: string | URL) => boolean) | undefined> {
  let content = ''

  if (ignoreFile) {
    content += (await readFile(ignoreFile)) ?? ''
  }

  if (!withNodeModules) {
    content += '\n' + 'node_modules'
  }

  if (!content) {
    return
  }

  const ignore = createIgnore({ allowRelativePaths: true }).add(content)

  return (file) => ignore.ignores(slash(getRelativePath(file, ignoreFile)))
}

async function createIsIgnoredFunction(
  ignoreFiles: (string | URL | undefined)[],
  withNodeModules?: boolean
): Promise<(file: string | URL) => boolean> {
  // If `ignoreFilePaths` is empty, we still want `withNodeModules` to work
  if (ignoreFiles.length === 0 && !withNodeModules) {
    ignoreFiles = [undefined]
  }

  const isIgnoredFunctions = (
    await Promise.all(
      ignoreFiles.map((ignoreFile) =>
        createSingleIsIgnoredFunction(ignoreFile, withNodeModules)
      )
    )
  ).filter(Boolean)

  return (file) => isIgnoredFunctions.some((isIgnored) => isIgnored!(file))
}

export { createIsIgnoredFunction }
