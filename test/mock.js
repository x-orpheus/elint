'use strict';

const path = require('path');

let origin = process.cwd;

module.exports = function mock() {
  process.cwd = () => {
    return path.join(__dirname, 'test-project');
  };

  return () => {
    process.cwd = origin;
  };
};
