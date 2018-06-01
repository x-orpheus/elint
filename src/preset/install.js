'use strict';

const isNpm = require('is-npm');
const installFromCli = require('./install-cli');
const installFromScripts = require('./install-scripts');

module.exports = isNpm ? installFromScripts : installFromCli;
