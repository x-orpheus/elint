const { isFunction } = require('lodash')

function loadESModule (moduleInstance) {
  if (isFunction(moduleInstance.default)) {
    return moduleInstance.default
  }

  return moduleInstance
}

module.exports = loadESModule
