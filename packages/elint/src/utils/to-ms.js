'use strict'

const ms = require('ms')

/**
 * 转换为毫秒数
 *
 * @param {string|number} value 待转换的值
 * @returns {number} 转换后的毫秒值
 */
function toMs (value) {
  if (!['number', 'string'].includes(typeof value)) {
    return 0
  }

  const num = +value
  if (!isNaN(num)) {
    return num
  }

  let msNum

  try {
    msNum = ms(value)
  } catch (error) {
    msNum = 0
  }

  if (typeof msNum === 'number') {
    return msNum
  }

  return 0
}

module.exports = toMs
