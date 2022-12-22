import { createRequire } from 'module'
import { join } from 'path'
import { pathToFileURL } from 'url'

function getModulePath(id: string, fromPath: string) {
  const require = createRequire(join(fromPath, '__placeholder__.js'))

  return require.resolve(id)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function importFromPath<T = any>(id: string, fromPath: string): Promise<T> {
  return import(pathToFileURL(getModulePath(id, fromPath)).toString())
}

export default importFromPath
