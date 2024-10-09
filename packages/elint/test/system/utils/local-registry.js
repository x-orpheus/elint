import path from 'node:path'
import fs from 'fs-extra'
import { fileURLToPath } from 'node:url'
import run from './run.js'
import { runServer } from 'verdaccio'
import { verdaccioPort, tempTestPresetDir } from './variable.js'

export const loginLocalRegistry = async () => {
  await run(
    `pnpm npm-auth-to-token -u test -p test -e test@test.com -r http://localhost:${verdaccioPort}`,
    tempTestPresetDir
  )
}

/** @type (() => Promise<void>) | undefined */
export let closeLocalRegistry

export const startUpLocalRegistry = async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const configPath = path.join(__dirname, 'verdaccio-config.yaml')

  /** @type {import('node:http').Server} */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const app = await runServer(configPath)

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return new Promise((resolve, reject) => {
    const teardown = async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return new Promise((resolve) => {
        app.close(() => {
          console.log('verdaccio closed')
          resolve()
        })
      })
    }

    app.listen(verdaccioPort, () => {
      console.log(`verdaccio running on: ${verdaccioPort}`)

      resolve()

      closeLocalRegistry = teardown
    })

    app.on('error', reject)
  })
}

/**
 * @param {string} packageDir
 */
export const publishToLocalRegistry = async (packageDir) => {
  await run(
    `pnpm publish --registry=http://localhost:${verdaccioPort} --no-git-check --silent`,
    packageDir,
    {
      customEnv: {
        npm_config_userconfig: path.join(tempTestPresetDir, '.npmrc')
      }
    }
  )
}

/**
 * @param {string} packageDir
 */
export const bumpPackageVersion = async (packageDir) => {
  const packageJsonPath = path.join(packageDir, 'package.json')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const packageJson = await fs.readJSON(packageJsonPath)

  await fs.writeJSON(packageJsonPath, {
    ...packageJson,
    version: '999.999.999'
  })
}
