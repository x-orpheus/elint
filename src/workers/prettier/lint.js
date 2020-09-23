'use strict'

const prettier = require('prettier')
const fs = require('fs-extra')
const { lintContents: eslintLintContents } = require('../eslint/lint')
const { lintContents: stylelintLintContents } = require('../stylelint/lint')

const { errors } = prettier.__internal

const getOptionsForFile = (filename) => {
  const options = {
    ...prettier.resolveConfig(filename, { editorconfig: false }),
    filepath: filename
  }
  return options
}

const handlePrettierError = (filename, error) => {
  const isParseError = Boolean(error && error.loc)
  const isValidationError = /^Invalid \S+ value\./.test(error && error.message)

  let message

  if (isParseError) {
    // `invalid.js: SyntaxError: Unexpected token (1:1)`.
    message = `${filename}: ${String(error)}`
  } else if (isValidationError || error instanceof errors.ConfigError) {
    // `Invalid printWidth value. Expected an integer, but received 0.5.`
    message = error.message
    // If validation fails for one file, it will fail for all of them.
    process.exit(1)
  } else if (error instanceof errors.DebugError) {
    // `invalid.js: Some debug error message`
    message = `${filename}: ${error.message}`
  } else {
    // `invalid.js: Error: Some unexpected error\n[stack trace]`
    /* istanbul ignore next */
    message = filename + ': ' + (error.stack || error)
  }

  return message
}

const linters = {
  es: eslintLintContents,
  style: stylelintLintContents
}

const lintFiles = async (files, type, fix = false) => {
  if (!files.length) {
    return {
      success: true,
      type,
      results: [],
      messages: []
    }
  }

  let success = true
  const prettierMessages = []
  const results = []

  const tasks = []

  files.forEach((filename) => {
    tasks.push(
      (async () => {
        let input
        try {
          input = fs.readFileSync(filename, 'utf-8')
        } catch {
          success = false
          const message = `${filename}: 文件读取错误`
          prettierMessages.push(message)
          return
        }

        const lintResult = await lintContents(
          [
            {
              fileName: filename,
              fileContent: input
            }
          ],
          type
        )

        success = lintResult.success
        prettierMessages.push(...lintResult.messages)
        results.push(...lintResult.results)

        const output = lintResult.outputs[0]

        const isDifferent = output !== input

        if (isDifferent) {
          if (fix) {
            if (output !== undefined) {
              try {
                fs.writeFileSync(filename, output, {
                  encoding: 'utf-8'
                })
              } catch {
                success = false
                const message = `${filename}: 保存文件出错`
                prettierMessages.push(message)
              }
            }
          }
        }
      })()
    )
  })

  await Promise.all(tasks)

  return {
    success,
    results,
    messages: prettierMessages
  }
}

const lintContents = async (contents, type) => {
  if (!contents.length) {
    return {
      success: true,
      results: [],
      messages: []
    }
  }

  let success = true
  const prettierMessages = []
  const results = []
  const outputs = []

  const tasks = []

  contents.forEach((content, index) => {
    const filename = content.fileName
    const input = content.fileContent
    outputs[index] = input
    tasks.push(
      (async () => {
        const options = getOptionsForFile(filename)
        let formatted = input
        try {
          formatted = prettier.format(input, options)
        } catch (error) {
          success = false
          const message = handlePrettierError(filename, error)
          prettierMessages.push(message)
          return
        }
        let output = formatted

        if (linters[type]) {
          const result = await linters[type](
            [
              {
                fileContent: formatted,
                fileName: filename
              }
            ],
            true
          )

          const linterSuccess = result.success
          if (!linterSuccess) {
            success = linterSuccess
          }
          results.push(...result.results)

          switch (type) {
            case 'es':
              output = result.results[0].output
              break
            case 'style':
              output = result.outputs[0]
              break
          }
        }

        const isDifferent = output !== content.fileContent
        outputs[index] = output

        if (isDifferent) {
          success = false
          prettierMessages.push(`${filename}: 未格式化`)
        }
      })()
    )
  })

  await Promise.all(tasks)

  return {
    success,
    results,
    outputs,
    messages: prettierMessages
  }
}

module.exports = {
  lintFiles,
  lintContents
}
