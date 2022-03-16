'use strict'

const debug = require('debug')('elint:notifier:fetchRegistryInfo')
const fetch = require('node-fetch')

/**
 * 请求指定仓库中 package 的详细信息
 *
 * @param {string} registryUrl 仓库地址
 * @param {string} presetName preset name
 * @returns {object} presetInfo 详细的 package 信息
 */
function fetchRegistryInfo (registryUrl, presetName) {
  const api = `${registryUrl}/${presetName}`

  debug(`fetch: ${api}`)

  return fetch(api, { method: 'GET', timeout: 3000 })
    .then(res => res.json())
    .then(data => {
      const lastVersion = data['dist-tags'].latest
      return data.versions[lastVersion]
    })
    .catch(error => {
      debug('fetch error: %o', error)
      return null
    })
}

module.exports = fetchRegistryInfo
