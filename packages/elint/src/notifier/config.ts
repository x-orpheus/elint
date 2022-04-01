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

import Configstore from 'configstore'
const conf = new Configstore('elint')

/**
 * 获取上次检测(并提醒)的时间
 *
 * @param presetName Preset Name
 * @returns 上次检测时间
 */
export function getLastNotifyTime(presetName: string): number {
  return conf.get(`notifier.${presetName}`)
}

/**
 * 更新本地存储的检测时间
 *
 * @param presetName Preset Name
 */
export function updateNotifyTime(presetName: string): void {
  conf.set(`notifier.${presetName}`, Date.now())
}
