'use strict'

const _ = require('lodash')
const stylelint = require('stylelint')
const setBlocking = require('../../utils/set-blocking')
const customFormatter = require('./formatter')

const lintFiles = ({
  files,
  fix
}) => {
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

const lintContent = ({
  code,
  codeFileName
}) => {
  return stylelint
    .lint({
      code,
      codeFileName
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

(async () => {
  const result = {
    name: 'stylelint',
    output: '',
    success: true
  }

  const fileAndContents = process.argv.slice(3)
  let options = {}

  try {
    options = JSON.parse(process.argv[2])
  } catch (error) {
    // do nothing
  }

  const fix = !!options.fix

  const files = []
  const contents = []

  fileAndContents.forEach(item => {
    typeof item === 'string' ? files.push(item) : contents.push(item)
  })

  const lintResults = await Promise.all([
    lintFiles({ files, fix }),
    ...contents.map(content => {
      lintContent({
        code: content.fileContent,
        codeFileName: content.fileName
      })
    })
  ])

  let success = true
  const output = []

  lintResults.forEach(item => {
    success = success && item.success
    output.push(item.output)
  })

  result.success = success
  result.output = customFormatter(_.flatten(output))

  setBlocking(true)
  process.stdout.write(JSON.stringify(result))
  process.exit()
})()
