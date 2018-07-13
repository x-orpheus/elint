'use strict'

const lodash = require('lodash')

function sort (obj) {
  if (!lodash.isPlainObject(obj)) {
    return obj
  }

  const sortedObj = {}
  const keys = Object.keys(obj).sort()

  keys.forEach(key => {
    sortedObj[key] = obj[key]
  })

  return sortedObj
}

module.exports = sort
