const stylelint = require('stylelint')

const lintFiles = (files, fix) => {
  return stylelint
    .lint({
      files,
      fix
    })
    .then((data) => ({
      success: !data.errored,
      output: data.results
    }))
    .catch((error) => ({
      success: false,
      output: error.stack
    }))
}

const lintContent = (code, codeFilename, fix) => {
  return stylelint
    .lint({
      code,
      codeFilename,
      fix
    })
    .then((data) => ({
      success: !data.errored,
      output: data.results
    }))
    .catch((error) => ({
      success: false,
      output: error.stack
    }))
}

module.exports = {
  lintFiles,
  lintContent
}
