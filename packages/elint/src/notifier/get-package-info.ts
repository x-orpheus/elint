import _debug from 'debug'
import { execa } from 'execa'
import detectPackageManager, {
  PackageManager
} from './detect-package-manager.js'

const debug = _debug('elint:notifier:getPackageInfo')

const PACKAGE_MANAGER_INFO_COMMAND: Record<PackageManager, string> = {
  npm: 'npm info {} --json',
  pnpm: 'pnpm info {} --json',
  yarn: 'yarn info {} --json',
  'yarn@berry': 'yarn npm info {} --json'
}

export interface PackageInfo {
  name: string
  description: string
  'dist-tags': {
    latest: string
    [key: string]: string
  }
  time: Record<string, string>
  versions: string[]
  version: string
  gitHead: string
  dist: {
    shasum: string
    size: number
    tarball: string
    [key: string]: string | number
  }
  [key: string]: unknown
}

async function getPackageInfo(
  packageName: string,
  cwd: string
): Promise<PackageInfo | null> {
  const packageManager = await detectPackageManager(cwd)

  debug(`current package manager: ${packageManager}`)

  if (!packageManager) {
    return null
  }

  try {
    const commands = PACKAGE_MANAGER_INFO_COMMAND[packageManager]
      .replace('{}', packageName)
      .split(' ')

    const { stdout } = await execa(commands[0], commands.slice(1), {
      cwd
    })

    let info: PackageInfo = JSON.parse(stdout)

    if (packageManager === 'yarn') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      info = (info as any).data
    }

    if (!info || info.name !== packageName) {
      throw new Error('not a valid package info')
    }

    debug(`get package info: ${info}`)

    return info
  } catch (e) {
    debug('get package info error: %o', e)
    return null
  }
}

export default getPackageInfo
