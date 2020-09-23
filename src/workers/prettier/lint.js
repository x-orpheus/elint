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
        // 配置文件读取不到就直接让进程挂了
        const options = getOptionsForFile(filename)

        let input
        try {
          input = fs.readFileSync(filename, 'utf-8')
        } catch {
          success = false
          const message = `${filename}: 文件读取错误`
          prettierMessages.push(message)
          return
        }

        let formatted
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
          success = linterSuccess
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
          } else {
            success = false
            prettierMessages.push(`${filename}: 未格式化`)
          }
        }
      })()
    )
  })

  await Promise.all(tasks)

  return {
    success,
    type,
    results,
    messages: prettierMessages
  }
}

const lintContents = async (contents, type) => {
  if (!contents.length) {
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

  contents.forEach((content) => {
    const filename = content.fileName
    const input = content.fileContent
    tasks.push(
      (async () => {
        const options = getOptionsForFile(filename)
        let formatted
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
            {
              fileContent: formatted,
              fileName: content.fileName
            },
            true
          )

          const linterSuccess = result.success

          results.push(...result.results)

          if (linterSuccess) {
            switch (type) {
              case 'es':
                output = result.results[0].output
                break
              case 'style':
                output = result.outputs[0]
                break
            }
          } else {
            success = false
            const message = `${filename}: lint 出错`
            prettierMessages.push(message)
            return
          }
        }

        const isDifferent = output !== content.fileContent

        if (isDifferent) {
          prettierMessages.push(`${filename}: 未格式化`)
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

module.exports = {
  lintFiles,
  lintContents
}
