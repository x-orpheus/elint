import { createRequire } from 'module'
// import fs from 'fs-extra'
import path from 'path'
import mock from '../mock/env.js'
import { getBaseDir } from '../../../src/env.js'
import runInHusky from '../mock/run-in-husky.js'
import walker from '../../../src/walker/index.js'

const require = createRequire(import.meta.url)
const gitInitPath = require.resolve('../mock/git-init').replace('.ts', '.js')
// const appendFilePath = require.resolve('../mock/append-file')
const walkerPath = require.resolve('../../../src/walker').replace('.ts', '.js')

describe('Walker 测试', () => {
  let unmock: () => void
  let baseDir: string
  let getPath: (p: string) => string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
    getPath = (p) => {
      return path.join(p)
    }
  })

  afterEach(() => {
    unmock()
  })

  describe('功能测试', () => {
    test('空测试', async () => {
      const result: string[] = []
      const expected = await walker([], { cwd: baseDir })

      expect(expected).toEqual(result)
    })

    test('普通环境', async () => {
      const result: string[] = []

      const expected = await walker(['*.txt'], { cwd: baseDir })

      expect(expected).toEqual(result)
    })

    test('husky 环境：匹配不到', async () => {
      const tmpl = `
        import walker from '${walkerPath}'
        import gitInit from '${gitInitPath}'

        gitInit().then(() => {
          walker(['*.txt'], {cwd: '${baseDir}'}).then(result => {
            process.stdout.write(JSON.stringify(result))
          })
        })
      `
      const result: string[] = []

      const expected = await runInHusky(tmpl)

      expect(JSON.parse(JSON.parse(expected))).toEqual(result)
    })

    test('husky 环境：可以匹配到', async () => {
      const tmpl = `
      import walker from '${walkerPath}'
      import gitInit from '${gitInitPath}'

        gitInit().then(() => {
          walker(['src/**/*.js'], {cwd: '${baseDir}'}).then(result => {
            process.stdout.write(JSON.stringify(result))
          })
        })
      `

      const result = [getPath('src/a.js'), getPath('src/lib/b.js')]

      const expected = await runInHusky(tmpl)
      const parsedExpected = JSON.parse(JSON.parse(expected))

      expect(parsedExpected).toIncludeSameMembers(result)
    })
  })

  describe('Ignore 功能测试', () => {
    test('开启忽略规则', async () => {
      const result = [
        getPath('app/c.js'),
        getPath('src/a.js'),
        getPath('src/lib/b.js')
      ]

      const expected = await walker(['**/*.js'], { cwd: baseDir })

      expect(expected).toIncludeSameMembers(result)
    })

    test('关闭忽略规则', async () => {
      const result = [
        getPath('app/c.js'),
        getPath('src/a.js'),
        getPath('src/lib/b.js'),
        getPath('node_modules/elint-preset-node/index.js'),
        getPath('node_modules/elint-preset-node/.eslintrc.js'),
        getPath('node_modules/elint-preset-node/.stylelintrc.js'),
        getPath('node_modules/elint-preset-normal/index.js'),
        getPath('node_modules/elint-preset-normal/.eslintrc.js'),
        getPath('node_modules/elint-preset-normal/.stylelintrc.js'),
        getPath('node_modules/@scope/elint-preset-scope/index.js'),
        getPath('node_modules/@scope/elint-preset-scope/.eslintrc.js'),
        getPath('node_modules/@scope/elint-preset-scope/.stylelintrc.js'),
        getPath('bower_components/a.js')
      ]

      const expected = await walker(['**/*.js'], {
        noIgnore: true,
        cwd: baseDir
      })

      expect(expected).toIncludeSameMembers(result)
    })
  })

  // describe('staged file 测试', () => {
  //   test('包含 staged file', async () => {
  //     const fileName = 'src/lib/b.js'
  //     const absFileName = path.join(baseDir, fileName)
  //     const tmpl = `
  //       const walker = require('${walkerPath}')
  //       const gitInit = require('${gitInitPath}')
  //       const appendFile = require('${appendFilePath}')

  //       gitInit()
  //         .then(() => appendFile(['${fileName}']))
  //         .then(() => {
  //           walker(['src/**/*.js']).then(result => {
  //             process.stdout.write(JSON.stringify(result))
  //           })
  //         })
  //     `

  //     const result = {
  //       es: [
  //         getPath('src/a.js'),
  //         {
  //           fileName: absFileName,
  //           fileContent: fs.readFileSync(absFileName).toString()
  //         }
  //       ],
  //       style: []
  //     }

  //     const expected = await runInHusky(tmpl)
  //     const parsedExpected = JSON.parse(JSON.parse(expected))

  //     expect(parsedExpected.es).toIncludeSameMembers(result.es)
  //     expect(parsedExpected.style).toIncludeSameMembers(result.style)
  //   })

  //   test('包含多个 staged file', async () => {
  //     const fileName1 = 'src/lib/b.js'
  //     const absFileName1 = path.join(baseDir, fileName1)
  //     const fileName2 = 'src/a.css'
  //     const absFileName2 = path.join(baseDir, fileName2)

  //     const tmpl = `
  //       const walker = require('${walkerPath}')
  //       const gitInit = require('${gitInitPath}')
  //       const appendFile = require('${appendFilePath}')

  //       gitInit()
  //         .then(() => appendFile(['${fileName1}', '${fileName2}']))
  //         .then(() => {
  //           walker(['src/**/*.+(js|css)']).then(result => {
  //             process.stdout.write(JSON.stringify(result))
  //           })
  //         })
  //     `

  //     const result = {
  //       es: [
  //         getPath('src/a.js'),
  //         {
  //           fileName: absFileName1,
  //           fileContent: fs.readFileSync(absFileName1).toString()
  //         }
  //       ],
  //       style: [
  //         {
  //           fileName: absFileName2,
  //           fileContent: fs.readFileSync(absFileName2).toString()
  //         }
  //       ]
  //     }

  //     const expected = await runInHusky(tmpl)

  //     const parsedExpected = JSON.parse(JSON.parse(expected))

  //     expect(parsedExpected.es).toIncludeSameMembers(result.es)
  //     expect(parsedExpected.style).toIncludeSameMembers(result.style)
  //   })
  // })
})
