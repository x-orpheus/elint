import chalk, { ChalkInstance } from 'chalk'
import figures from 'figures'

interface ColorFnAndIcon {
  /**
   * 图标
   */
  icon: string
  /**
   * 着色函数
   */
  colorFn: ChalkInstance
}

type LogType = 'error' | 'warn' | 'success' | 'info'

type LogFunction = (...message: unknown[]) => void

/**
 * 根据 type 获取 colorFn 和 Icon
 *
 * @param type 日志类型
 * @returns colorFn and icon
 */
function getColorFnAndIconByType(type?: LogType): ColorFnAndIcon {
  let colorFn, icon

  switch (type) {
    case 'error':
      colorFn = chalk.red
      icon = figures.cross
      break
    case 'warn':
      colorFn = chalk.yellow
      icon = figures.warning
      break
    case 'success':
      colorFn = chalk.green
      icon = figures.tick
      break
    default:
      colorFn = chalk.blue
      icon = figures.info
      break
  }

  return { colorFn, icon }
}

/**
 * 构造日志函数
 *
 * @param  type 日志类型
 */
function logCreator(type?: LogType): LogFunction {
  return (...message) => {
    if (!message.length) {
      return
    }

    const { colorFn, icon } = getColorFnAndIconByType(type)
    const output = ['']

    message.forEach((item, index) => {
      if (index === 0) {
        output.push(`  ${icon} ${item}`)
        return
      }

      output.push(`    ${item}`)
    })

    output.push('')

    console.log(colorFn(output.join('\n')))
  }
}

const log: Record<LogType, LogFunction> = {
  error: logCreator('error'),
  warn: logCreator('warn'),
  success: logCreator('success'),
  info: logCreator()
}

export default log
