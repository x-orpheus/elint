import { execa } from 'execa'
import { getBaseDir } from '../../../src/env.js'

async function gitInit() {
  const options = {
    cwd: getBaseDir()
  }

  await execa('git', ['init'], options)
  await execa('git', ['config', 'core.autocrlf', 'false'], options)
  await execa('git', ['add', '.'], options)
}

export default gitInit
