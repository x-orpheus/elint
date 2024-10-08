import path from 'node:path'
import fs from 'fs-extra'
import mock from '../mock/env.js'
import tryRequire from '../../../src/utils/try-require.js'
import { getBaseDir } from '../../../src/env.js'

describe('try-require 测试', () => {
  let unmock: () => void
  let baseDir: string

  beforeEach(() => {
    unmock = mock()
    baseDir = getBaseDir()
  })

  afterEach(() => {
    unmock()
  })

  test('边界条件: baseDir 不存在', async () => {
    await fs.remove(baseDir)
    expect(tryRequire(/name/, baseDir)).toEqual([])
  })

  test('边界条件: baseDir 下 node_modules 不存在', async () => {
    const nodeModulesDir = path.join(baseDir, 'node_modules')
    await fs.remove(nodeModulesDir)
    expect(tryRequire(/name/, baseDir)).toEqual([])
  })

  test('边界条件: baseDir 下 node_modules 为空', async () => {
    const nodeModulesDir = path.join(baseDir, 'node_modules')
    await fs.emptyDir(nodeModulesDir)
    expect(tryRequire(/name/, baseDir)).toEqual([])
  })

  test('模块不存在', () => {
    expect(tryRequire(/name/, baseDir)).toEqual([])
    expect(tryRequire(/hello/, baseDir)).toEqual([])
  })

  test('模块存在', () => {
    const result1 = [
      '@scope/elint-preset-scope',
      'elint-preset-node',
      'elint-preset-normal'
    ]

    const result2 = result1.concat(['elint-plugin-cjs', 'elint-plugin-esm'])

    const result3 = ['elint-preset-node']

    expect(tryRequire(/elint-preset/, baseDir)).toEqual(result1)
    expect(tryRequire(/elint/, baseDir)).toIncludeSameMembers(result2)
    expect(tryRequire(/node/, baseDir)).toEqual(result3)
  })

  test('存在隐藏文件（点开头）', async () => {
    const result = ['elint-preset-node']

    // 创建文件
    const filePath = path.join(baseDir, 'node_modules/.node.name')
    await fs.ensureFile(filePath)

    expect(tryRequire(/node/, baseDir)).toEqual(result)
  })
})
