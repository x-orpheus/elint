import path from 'path'
import fs from 'fs-extra'
import run from './run.js'
import verdaccio from 'verdaccio'
import { verdaccioPort, verdaccioDir } from './variable.js'

const startServer = verdaccio.default

export const cleanLocalRegistry = async (packageName) => {
  let dir = verdaccioDir
  if (packageName) {
    dir = path.resolve(dir, packageName)
  }
  return fs.remove(dir)
}

export const startUpLocalRegistry = async () => {
  return new Promise((resolve, reject) => {
    startServer(
      {
        storage: verdaccioDir,
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
        packages: {
          '@*/*': { access: '$all', publish: '$all', proxy: 'npmjs' },
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
    `pnpm publish --registry=http://localhost:${verdaccioPort} --no-git-checks`,
    packageDir
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
