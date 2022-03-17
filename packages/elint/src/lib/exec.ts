import _debug from 'debug'
import { execa } from 'execa'

const debug = _debug('elint:lib:exec')

const exec = (pargram: string) => {
  return (...argus: string[]) => {
    const parsedArgus = argus.map((argu) => {
      if (typeof argu === 'object') {
        return JSON.stringify(argu)
      }

      return argu
    })

    debug(`run: ${pargram} ${parsedArgus.join(' ')}`)

    const env = Object.assign(
      {},
      {
        FORCE_COLOR: 1
      },
      process.env
    )

    return execa(pargram, [...parsedArgus], {
      env
    })
  }
}

export default exec
