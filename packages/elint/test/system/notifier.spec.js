/**
 * 更新检查测试
 *
 * 使用 elint-preset-test 测试更新检查功能
 * v1.2.0 开始，package.json 加入 elint 配置：
 */

import resetCacheProject from './utils/reset-cache-project.js'
import run from './utils/run.js'
import { verdaccioPort } from './utils/variable.js'

/** @type string */
let tmpDir

/**
 * 无需每次都 reset
 */
beforeAll(async () => {
  tmpDir = await resetCacheProject()
})

test('安装 latest，显示更新提示', async () => {
  const { stdout } = await run(
    `npm run lint-fix --registry=http://localhost:${verdaccioPort} -- --force-notifier`,
    tmpDir,
    {
      disableNotifier: false,
      stdio: 'pipe'
    }
  )

  expect(stdout).toContain('update available')
})
