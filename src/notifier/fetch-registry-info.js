'use strict'

const debug = require('debug')('elint:notifier:fetchRegistryInfo')
const fetch = require('node-fetch')

function fetchRegistryInfo (registryUrl, presetName) {
  const api = `${registryUrl}/${presetName}`

  debug(`fetch: ${api}`)

  return fetch(api)
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
