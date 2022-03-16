'use strict'

/**

path：
  ~/.config/configstore/elint.json

content:
  {
    "notifier": {
      "elint-preset-standard": 1546830743558,
      "elint-preset-xo": 1546830743558
    }
  }

*/

const Configstore = require('configstore')
const conf = new Configstore('elint')

/**
 * 获取上次检测(并提醒)的时间
 *
 * @param {string} presetName Preset Name
 * @returns {number} 上次检测时间
 */
function getLastNotifyTime (presetName) {
  return conf.get(`notifier.${presetName}`)
}

/**
 * 更新本地存储的检测时间
 *
 * @param {string} presetName Preset Name
 * @returns {void}
 */
function update (presetName) {
  conf.set(`notifier.${presetName}`, Date.now())
}

module.exports = {
  getLastNotifyTime,
  update
}
