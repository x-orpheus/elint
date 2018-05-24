'use strict';

exports.elint = require('./elint');

exports.install = require('./preset/install');

exports.diff = require('./preset/diff');

exports.commitlint = require('./works/commitlint');

exports.runHooks = require('./hooks');

exports.version = require('./version');
