const stylelint = require('stylelint')

const lintFiles = (files, fix) => {
  return stylelint
    .lint({
      files,
      fix
    })
    .then((data) => ({
      success: !data.errored,
      results: data.results
    }))
    .catch((error) => ({
      success: false,
      results: error.stack
    }))
}

const lintContents = async (contents, fix) => {
  if (!contents.length) {
    return {
      success: true,
      results: [],
      // 额外输出经过 lint 后的代码
      outputs: []
    }
  }

  const tasks = []

  const results = []
  const outputs = []
  let success = true

  contents.forEach((content) => {
    tasks.push(
      stylelint
        .lint({
          code: content.fileContent,
          codeFilename: content.fileName,
          fix
        })
        .then((data) => {
          if (data.errored) {
            success = false
          }
          results.push(data.results)
          outputs.push(data.output)
        })
        .catch((error) => {
          success = false
          results.push(error.stack)
          outputs.push(content.fileContent)
        })
    )
  })

  await Promise.all(tasks)

  return {
    success,
    results,
    outputs
  }
}

module.exports = {
  lintFiles,
  lintContents
}
