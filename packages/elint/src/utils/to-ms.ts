import ms from 'ms'

/**
 * 转换为毫秒数
 *
 * @param value 待转换的值
 * @returns 转换后的毫秒值
 */
function toMs(value: string | number): number {
  if (!['number', 'string'].includes(typeof value)) {
    return 0
  }

  const num = +value
  if (!isNaN(num)) {
    return num
  }

  let msNum

  try {
    msNum = ms(value as string)
  } catch (error) {
    msNum = 0
  }

  if (typeof msNum === 'number') {
    return msNum
  }

  return 0
}

export default toMs
