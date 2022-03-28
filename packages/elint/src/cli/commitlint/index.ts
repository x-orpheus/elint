import { getBaseDir } from '../../env'
import { executeElintPlugin } from '../../plugin/execute'
import { formatReportResults } from '../../utils/report'
import { elintPluginCommitLint } from './plugin'

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
