const _ = require('lodash')

function loadESModule (moduleInstance) {
  if (_.isFunction(moduleInstance.default)) {
    return moduleInstance.default
  }

  return moduleInstance
}

module.exports = loadESModule
