import { cyan, gray, green, red, yellow } from 'https://deno.land/std@0.200.0/fmt/colors.ts'

export const logLevels = ['silent', 'error', 'info', 'debug'] as const
export type LogLevel = (typeof logLevels)[number]

const levelRank: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  info: 2,
  debug: 3,
}

let currentLevel: LogLevel = 'info'

export const setLogLevel = (level: LogLevel) => {
  currentLevel = level
}

export const getLogLevel = (): LogLevel => currentLevel

const enabled = (level: LogLevel) => levelRank[currentLevel] >= levelRank[level]

const debug = (action: string, message: string, subject?: string) => {
  if (!enabled('debug')) return
  // oxlint-disable-next-line no-console
  console.log(`${gray(action)} ${message} ${subject ? cyan(subject) : ''}`)
}

const positive = (action: string, message: string, subject?: string) => {
  if (!enabled('info')) return
  // oxlint-disable-next-line no-console
  console.log(`${green(action)} ${message} ${subject ? cyan(subject) : ''}`)
}

const neutral = (action: string, message: string, subject?: string) => {
  if (!enabled('info')) return
  // oxlint-disable-next-line no-console
  console.log(`${yellow(action)} ${message} ${subject ? cyan(subject) : ''}`)
}

const error = (action: string, message: string, subject?: string) => {
  const msg = `${red(action)} ${message} ${subject ? cyan(subject) : ''}`
  if (enabled('error')) {
    // oxlint-disable-next-line no-console
    console.error(msg)
  }
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
