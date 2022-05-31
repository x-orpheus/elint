import path from 'path'
import fs from 'fs-extra'
import run from './run.js'
import verdaccio from 'verdaccio'
import { verdaccioPort, tempTestPresetDir } from './variable.js'

const startServer = verdaccio.default

export const loginLocalRegistry = async () => {
  await run(
    `pnpm npm-auth-to-token -u test -p test -e test@test.com -r http://localhost:${verdaccioPort}`,
    tempTestPresetDir
  )
}

export const startUpLocalRegistry = async () => {
  return new Promise((resolve, reject) => {
    startServer(
      {
        store: {
          memory: {
            limit: 1000
          }
        },
        auth: {
          'auth-memory': {
            users: {
              foo: {
                name: 'test',
                password: 'test'
              }
            }
          }
        },
        middlewares: {
          audit: { enabled: true }
        },
        uplinks: { npmjs: { url: 'https://registry.npmjs.org/' } },
        publish: {
          allow_offline: true
        },
        packages: {
          elint: {
            access: '$all',
            publish: '$all'
          },
          'elint-*': {
            access: '$all',
            publish: '$all'
          },
          '**': {
            access: '$all',
            publish: '$all',
            proxy: 'npmjs'
          }
        },
        logs: {
          type: 'stdout',
          format: 'pretty',
          level: 'error'
        }
      },
      verdaccioPort,
      undefined,
      '1.0.0',
      'verdaccio',
      (webServer, address) => {
        const teardown = async () => {
          return new Promise((resolve) => {
            webServer.close(() => {
              console.log('verdaccio closed')
              resolve()
            })
          })
        }

        webServer.listen(address.port, address.host, () => {
          console.log(`verdaccio running on : ${address.host}:${address.port}`)

          resolve(teardown)
        })

        webServer.on('error', reject)
      }
    )
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
