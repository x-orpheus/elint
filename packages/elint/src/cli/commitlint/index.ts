import { getBaseDir } from '../../env.js'
import { executeElintPlugin } from '../../plugin/execute.js'
import { formatReportResults } from '../../utils/report.js'
import { elintPluginCommitLint } from './plugin.js'

export async function commitlint() {
  const executeResult = await executeElintPlugin(elintPluginCommitLint, '', {
    fix: false,
    cwd: getBaseDir()
  })

  if (executeResult.reportResult) {
    console.log()
    console.log(formatReportResults([executeResult.reportResult]))
    console.log()
  }

  process.exit(executeResult.success ? 0 : 1)
}
