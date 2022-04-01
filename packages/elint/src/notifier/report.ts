import chalk from 'chalk'
import boxen, { Options as BoxenOptions } from 'boxen'

export interface ReportInfo {
  /**
   * preset 名称
   */
  name: string
  /**
   * 当前版本
   */
  current: string
  /**
   * 最新版本
   */
  latest: string
}

/**
 * 生成 notifier 报告
 *
 * @param info 报告基础信息
 * @returns 用于输出的内容
 */
function report(info: ReportInfo): string | null {
  if (!info) {
    return null
  }

  const { name, current, latest } = info

  if (!name || !current || !latest) {
    return null
  }

  const messages = [
    `update available ${chalk.dim(current)} → ${chalk.green(latest)}`,
    `Run ${chalk.cyan('npm i ' + name + ' -D')} to update`
  ]

  const boxenOptions: BoxenOptions = {
    padding: 1,
    margin: 1,
    align: 'center',
    borderColor: 'yellow',
    borderStyle: 'round'
  }

  return boxen(messages.join('\n'), boxenOptions)
}

export default report
