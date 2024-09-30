import _debug from 'debug'
import fs from 'fs-extra'
import path from 'node:path'
import { findUp } from 'find-up'
import type { PackageJson } from '../types.js'

const debug = _debug('elint:notifier:')

const PACKAGE_MANAGERS = ['pnpm', 'yarn', 'yarn@berry', 'npm'] as const

export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

const PACKAGE_MANAGER_LOCKS: Record<string, PackageManager> = {
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm'
}

async function detectPackageManager(
  cwd: string
): Promise<PackageManager | null> {
  let packageManager: PackageManager | null = null

  const lockPath = await findUp(Object.keys(PACKAGE_MANAGER_LOCKS), { cwd })

  let packageJsonPath: string | undefined

  if (lockPath) {
    packageJsonPath = path.resolve(lockPath, '../package.json')
  } else {
    packageJsonPath = await findUp('package.json', { cwd })
  }

  if (packageJsonPath && fs.existsSync(packageJsonPath)) {
    try {
      const pkg = fs.readJsonSync(packageJsonPath) as PackageJson
      if (typeof pkg.packageManager === 'string') {
        const [name, version] = pkg.packageManager.split('@')
        if (name === 'yarn' && parseInt(version) > 1) {
          packageManager = 'yarn@berry'
        } else if (name in PACKAGE_MANAGERS) {
          packageManager = name as (typeof PACKAGE_MANAGERS)[number]
        }
      }
    } catch {}
  }

  if (!packageManager && lockPath) {
    packageManager = PACKAGE_MANAGER_LOCKS[path.basename(lockPath)] || null
  }

  debug(`detect: ${packageManager}`)

  return packageManager
}

export default detectPackageManager
