import { padEnd } from 'lodash'
import { version as elintVersion } from '../package.json'
import { version as eslintVersion } from 'eslint/package.json'
import { version as stylelintVersion } from 'stylelint/package.json'
import { version as commitlintVersion } from '@commitlint/core/package.json'
import { version as prettierVersion } from 'prettier/package.json'
import { version as huskyVersion } from 'husky/package.json'
import tryRequire from './utils/try-require'

/**
 * 输出 version
 */
function version(): void {
  const main: Record<string, string> = {
    elint: elintVersion
  }

  const dep: Record<string, string> = {
    eslint: eslintVersion,
    stylelint: stylelintVersion,
    commitlint: commitlintVersion,
    prettier: prettierVersion,
    husky: huskyVersion
  }

  const preset = tryRequire(/elint-preset/)[0]
  if (preset) {
    // eslint-disable-next-line global-require
    const { version: presetVersion } = require(`${preset}/package.json`)
    main[preset] = presetVersion
  }

  const output = ['> elint version', '']

  const mainNameLength = Math.max(...Object.keys(main).map((k) => k.length))

  Object.entries(main).forEach(([name, version]) => {
    output.push(`  ${padEnd(name, mainNameLength)} : ${version}`)
  })

  output.push('')
  output.push('  Dependencies:')

  const depNameLength = Math.max(...Object.keys(dep).map((k) => k.length))

  Object.entries(dep).forEach(([name, version]) => {
    output.push(`    ${padEnd(name, depNameLength)} : ${version}`)
  })

  output.push('')

  console.log(output.join('\n'))
}

export default version
