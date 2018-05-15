'use strict';

const path = require('path');

let origin = process.cwd;

function mock() {
  process.cwd = () => {
    return path.join(__dirname, 'test-project');
  }
}

function unmock() {
  process.cwd = origin;
}

module.exports = {
  mock,
  unmock
};
