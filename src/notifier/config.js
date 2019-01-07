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

function getLastNotifyTime (presetName) {
  return conf.get(`notifier.${presetName}`)
}

function update (presetName) {
  conf.set(`notifier.${presetName}`, Date.now())
}

module.exports = {
  getLastNotifyTime,
  update
}
