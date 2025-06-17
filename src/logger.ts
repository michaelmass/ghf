import { cyan, gray, green, red, yellow } from 'https://deno.land/std@0.200.0/fmt/colors.ts'

const debug = (action: string, message: string, subject?: string) => console.debug(`${gray(action)} ${message} ${subject ? cyan(subject) : ''}`)

const positive = (action: string, message: string, subject?: string) => console.debug(`${green(action)} ${message} ${subject ? cyan(subject) : ''}`)
const neutral = (action: string, message: string, subject?: string) => console.debug(`${yellow(action)} ${message} ${subject ? cyan(subject) : ''}`)

const error = (action: string, message: string, subject?: string) => {
  const msg = `${red(action)} ${message} ${subject ? cyan(subject) : ''}`
  console.debug(msg)
  return msg
}

const fatal = (action: string, message: string, subject?: string) => {
  const msg = error(action, message, subject)
  throw new Error(msg)
}

export const log = {
  debug,
  positive,
  neutral,
  error,
  fatal,
}
