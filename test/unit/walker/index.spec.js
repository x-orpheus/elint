'use strict'

const fs = require('fs-extra')
const path = require('path')
const mock = require('../mock/env')
const { getBaseDir } = require('../../../src/env')
const runInHusky = require('../mock/run-in-husky')
const walker = require('../../../src/walker')

const gitInitPath = require.resolve('../mock/git-init')
const appendFilePath = require.resolve('../mock/append-file')
const walkerPath = require.resolve('../../../src/walker')

const deepEqualInAnyOrder = require('deep-equal-in-any-order')
const chaiAsPromised = require('chai-as-promised')
const chai = require('chai')
chai.should()
chai.use(deepEqualInAnyOrder)
chai.use(chaiAsPromised)

describe('Walker 测试', function () {
  let unmock
  let baseDir
  let getPath

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
    getPath = p => {
      return path.join(baseDir, p)
    }
  })

  afterEach(() => {
    unmock()
  })

  describe('功能测试', function () {
    it('空测试', function () {
      return walker().should.eventually.deep.equal({
        es: [],
        style: []
      })
    })

    it('普通环境', function () {
      return walker(['*.txt']).should.eventually.deep.equal({
        es: [],
        style: []
      })
    })

    it('husky 环境：匹配不到', async () => {
      const tmpl = `
        const walker = require('${walkerPath}')
        const gitInit = require('${gitInitPath}')

        gitInit().then(() => {
          walker(['*.txt']).then(result => {
            process.stdout.write(JSON.stringify(result))
          })
        })
      `
      const result = { es: [], style: [] }

      const expected = await runInHusky(tmpl)

      return JSON.parse(JSON.parse(expected)).should.deep.equalInAnyOrder(result)
    })

    it('husky 环境：可以匹配到', async () => {
      const tmpl = `
        const walker = require('${walkerPath}')
        const gitInit = require('${gitInitPath}')

        gitInit().then(() => {
          walker(['src/**/*.js']).then(result => {
            process.stdout.write(JSON.stringify(result))
          })
        })
      `
      const result = {
        es: [getPath('src/a.js'), getPath('src/lib/b.js')],
        style: []
      }

      const expected = await runInHusky(tmpl)

      return JSON.parse(JSON.parse(expected)).should.deep.equalInAnyOrder(result)
    })
  })

  describe('Ignore 功能测试', function () {
    it('开启忽略规则', function () {
      const result = {
        es: [getPath('app/c.js'), getPath('src/a.js'), getPath('src/lib/b.js')],
        style: []
      }

      return walker(['**/*.js']).should.eventually.deep.equalInAnyOrder(result)
    })

    it('关闭忽略规则', function () {
      const result = {
        es: [
          getPath('.huskyrc.js'),
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
        ],
        style: []
      }

      return walker(['**/*.js'], { noIgnore: true }).should.eventually.deep.equalInAnyOrder(result)
    })
  })

  describe('staged file 测试', function () {
    it('包含 staged file', async () => {
      const fileName = 'src/lib/b.js'
      const absFileName = path.join(baseDir, fileName)
      const tmpl = `
        const walker = require('${walkerPath}')
        const gitInit = require('${gitInitPath}')
        const appendFile = require('${appendFilePath}')

        gitInit()
          .then(() => appendFile(['${fileName}']))
          .then(() => {
            walker(['src/**/*.js']).then(result => {
              process.stdout.write(JSON.stringify(result))
            })
          })
      `

      const result = {
        es: [
          getPath('src/a.js'),
          { fileName: absFileName, fileContent: fs.readFileSync(absFileName).toString() }
        ],
        style: []
      }

      const expected = await runInHusky(tmpl)

      return JSON.parse(JSON.parse(expected)).should.deep.equalInAnyOrder(result)
    })

    it('包含多个 staged file', async () => {
      const tmpl = `
        const walker = require('${walkerPath}')
        const gitInit = require('${gitInitPath}')
        const appendFile = require('${appendFilePath}')

        gitInit()
          .then(() => {
            walker(['src/**/*']).then(result => {
              process.stdout.write(JSON.stringify(result))
            })
          })
      `

      const result = {
        es: [
          getPath('src/a.js'),
          getPath('src/lib/b.js')
        ],
        style: [
          getPath('src/a.css')
        ]
      }

      const expected = await runInHusky(tmpl)

      return JSON.parse(JSON.parse(expected)).should.deep.equalInAnyOrder(result)
    })
  })
})
