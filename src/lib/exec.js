'use strict'

const debug = require('debug')('elint:lib:exec')
const execa = require('execa')

const exec = pargram => (...argus) => {
  debug(`run: ${pargram} ${argus.join(' ')}`)

  const env = Object.assign({}, {
    FORCE_COLOR: 1
  }, process.env)

  return execa(pargram, [...argus], {
    env
  })
}

module.exports = exec
