import path from 'path'
import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import run from './run.js'
import { runServer } from 'verdaccio'
import { verdaccioPort, tempTestPresetDir } from './variable.js'

export const loginLocalRegistry = async () => {
  await run(
    `pnpm npm-auth-to-token -u test -p test -e test@test.com -r http://localhost:${verdaccioPort}`,
    tempTestPresetDir
  )
}

export const startUpLocalRegistry = async () => {
  const __dirname = path.dirname(fileURLToPath(import.meta.url))
  const configPath = path.join(__dirname, 'verdaccio-config.yaml')

  const app = await runServer(configPath)

  return new Promise((resolve, reject) => {
    const teardown = async () => {
      return new Promise((resolve) => {
        app.close(() => {
          console.log('verdaccio closed')
          resolve()
        })
      })
    }

    app.listen(verdaccioPort, () => {
      console.log(`verdaccio running on: ${verdaccioPort}`)

      resolve(teardown)
    })

    app.on('error', reject)
  })
}

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

export const bumpPackageVersion = async (packageDir) => {
  const packageJsonPath = path.join(packageDir, 'package.json')
  const packageJson = await fs.readJSON(packageJsonPath)

  await fs.writeJSON(packageJsonPath, {
    ...packageJson,
    version: '999.999.999'
  })
}
