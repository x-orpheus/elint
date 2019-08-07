'use strict'

const debug = require('debug')('elint:lib:exec')
const execa = require('execa')

const exec = pargram => (...argus) => {
  const parsedArgus = argus.map(argu => {
    if (typeof argu === 'object') {
      return JSON.stringify(argu)
    }

    return argu
  })

  debug(`run: ${pargram} ${parsedArgus.join(' ')}`)

  const env = Object.assign({}, {
    FORCE_COLOR: 1
  }, process.env)

  return execa(pargram, [...parsedArgus], {
    env
  })
}

module.exports = exec
