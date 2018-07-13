'use strict'

exports.elint = require('./elint')

exports.installFromCli = require('./preset/install-cli')

exports.installFromScripts = require('./preset/install-scripts')

exports.diff = require('./preset/diff')

exports.commitlint = require('./workers/commitlint')

exports.runHooks = require('./hooks')

exports.version = require('./version')
