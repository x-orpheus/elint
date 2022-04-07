import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 测试项目
export const testProjectDir = path.join(__dirname, '../test-project')

// 缓存目录
export const cacheDir = path.join(os.tmpdir(), 'elint_test_system', 'cache')

// 备份目录
export const backupDir = path.join(os.tmpdir(), 'elint_test_system', 'backup')

export const projectDir = path.join(__dirname, '../../../../..')

export const verdaccioDir = path.join(projectDir, 'verdaccio')
export const verdaccioPort = 4873

export const publishPackageList = [
  'elint',
  'elint-helpers',
  'elint-plugin-commitlint',
  'elint-plugin-eslint',
  'elint-plugin-prettier',
  'elint-plugin-stylelint',
  'elint-preset-self'
]

// 需要发布的包
export const publishPackagePathList = publishPackageList.map((packageName) =>
  path.join(projectDir, 'packages', packageName)
)
