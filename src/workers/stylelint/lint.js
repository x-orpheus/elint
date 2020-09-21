const stylelint = require('stylelint')

const lintFiles = (files, fix) => {
  return stylelint
    .lint({
      files,
      fix
    })
    .then(data => ({
      success: !data.errored,
      output: data.results
    }))
    .catch(error => ({
      success: false,
      output: error.stack
    }))
}

const lintContents = (code, codeFilename) => {
  return stylelint
    .lint({
      code,
      codeFilename
    })
    .then(data => ({
      success: !data.errored,
      output: data.results
    }))
    .catch(error => ({
      success: false,
      output: error.stack
    }))
}

module.exports = {
  lintFiles,
  lintContents
}
