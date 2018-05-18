'use strict';

const npmi = require('npmi');
const { baseDir } = require('../utils/env');

function download(presetName) {
  const npmOptions = {
    path: baseDir,
    name: presetName,
    forceInstall: true,
    progress: false,
    npmLoad: {
      loglevel: 'verbose'
    }
  };

  return new Promise((resolve, reject) => {
    npmi(npmOptions, function (error, result) {
      if (error) {
        return reject(error);
      }

      const presetModuleName = result[0][0];
      const presetModulePath = result[0][1];

      return resolve({
        presetModuleName,
        presetModulePath
      });
    });
  });
}

module.exports = download;
