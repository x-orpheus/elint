'use strict';

const path = require('path');

let origin = process.env.INIT_CWD;

module.exports = function mock() {
  process.env.INIT_CWD = path.join(__dirname, 'test-project');

  return () => {
    process.env.INIT_CWD = origin;
  };
};
