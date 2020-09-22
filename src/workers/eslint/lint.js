'use strict'

const CLIEngine = require('eslint').CLIEngine

const lintFiles = (files, fix = false) => {
  if (!files.length) {
    return {
      success: true,
      results: []
    }
  }

  const engine = new CLIEngine({
    fix
  })

  const report = engine.executeOnFiles(files)

  if (fix) {
    CLIEngine.outputFixes(report)
  }

  return {
    success: !report.errorCount,
    results: report.results
  }
}

const lintContents = (contents, fix = false) => {
  if (!contents.length) {
    return {
      success: true,
      results: []
    }
  }

  const engine = new CLIEngine({
    fix
  })
  const reports = []
  let success = true

  contents.forEach(content => {
    const report = engine.executeOnText(content.fileContent, content.fileName)

    success = success && !report.errorCount

    reports.push(...report.results)
  })

  return {
    success,
    results: reports
  }
}

module.exports = {
  lintFiles,
  lintContents
}
