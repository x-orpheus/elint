import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 测试项目
export const testProjectDir = path.join(__dirname, '../test-project')

export const systemTestTempDir = path.join(os.tmpdir(), 'elint_test_system')

// 缓存目录
export const cacheDir = path.join(systemTestTempDir, 'cache')

// 备份目录
export const backupDir = path.join(systemTestTempDir, 'backup')

export const projectDir = path.join(__dirname, '../../../../..')

export const verdaccioPort = 4873

export const testPresetName = 'elint-preset-system-test'

export const tempTestPresetDir = path.join(systemTestTempDir, testPresetName)

export const testPresetDir = path.join(__dirname, '../test-preset')

export const publishPackageList = [
  'elint',
  'elint-helpers',
  'plugin-commitlint',
  'plugin-eslint',
  'plugin-prettier',
  'plugin-stylelint'
]

// 需要发布的包
export const publishPackagePathList = publishPackageList.map((packageName) =>
  path.join(projectDir, 'packages', packageName)
)
