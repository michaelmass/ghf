/**
 * @module
 *
 * This module contains the command line interface for the ghf cli.
 *
 */
import { compile } from 'npm:json-schema-to-typescript@15.0.4'
import data from '../deno.json' with { type: 'json' }
import { getConfig } from './config.ts'
import { Command, EnumType, z } from './deps.ts'
import { fileExists, writeTextFile } from './fs.ts'
import { type LogLevel, logLevels, setLogLevel } from './logger.ts'
import { applyPlans } from './plan.ts'
import { planRules } from './rules/index.ts'
import { loadSettings, settingsSchema } from './settings.ts'

const logLevelType = new EnumType(logLevels)

const resolveLogLevel = (opts: { logLevel?: LogLevel; quiet?: boolean; verbose?: boolean }): LogLevel => {
  if (opts.quiet) return 'silent'
  if (opts.verbose) return 'debug'
  return opts.logLevel ?? 'info'
}

const defaultExtends = 'https://michaelmass.github.io/ghf/ghf/default.json'

const initFormats = ['ts', 'json', 'yaml'] as const
type InitFormat = (typeof initFormats)[number]

const initFormatType = new EnumType(initFormats)

const defaultFilenames: Record<InitFormat, string> = {
  ts: '.ghf.ts',
  json: '.ghf.json',
  yaml: '.ghf.yaml',
}

const initTemplates: Record<InitFormat, string> = {
  ts: `import type { Config } from './.ghf.type'

export default {
  extends: ['${defaultExtends}'],
} satisfies Config`,
  json: `${JSON.stringify({ extends: [defaultExtends] }, null, 2)}\n`,
  yaml: `extends:\n  - ${defaultExtends}\n`,
}

type JSONSchema4 = Parameters<typeof compile>[0]

await new Command()
  .name('ghf')
  .version(data.version)
  .description('Command line to use the ghf cli')
  .type('log-level', logLevelType)
  .globalOption('--log-level <level:log-level>', 'Set the log level', { default: 'info' as LogLevel })
  .globalOption('-q, --quiet', 'Silence all logs (alias for --log-level=silent)', { default: false, conflicts: ['verbose'] })
  .globalOption('-v, --verbose', 'Enable debug logs (alias for --log-level=debug)', { default: false, conflicts: ['quiet'] })
  .command('apply', 'apply the git hidden files')
  .alias('sync')
  .alias('run')
  .option('-d, --dir <dir:string>', 'Directory to apply hidden files', { default: '.' })
  .option('--dry-run', 'Run the apply command without applying changes', { default: false })
  .option('--config <config:string>', 'The configuration file to get the hidden files settings', { default: '' })
  .action(async options => {
    setLogLevel(resolveLogLevel(options))
    const config = getConfig(options)
    if (config.dir && config.dir !== '.') {
      Deno.chdir(config.dir)
    }
    const settings = await loadSettings(config.config)
    const plans = await planRules(settings)
    await applyPlans(plans, { dryRun: config.dryRun })
  })
  .command('schema', 'returns the json schema for the ghf config file')
  .option('-o, --outfile <outfile:string>', 'Outfile to write to (ie: .ghf.schema.json)', { default: '' })
  .action(async ({ outfile }) => {
    const schema = z.toJSONSchema(settingsSchema, { io: 'input' })
    const json = JSON.stringify(schema, null, 2)

    if (outfile) {
      await writeTextFile(outfile, json)
    } else {
      // biome-ignore lint/suspicious/noConsole: this output the schema to the console
      console.log(json)
    }
  })
  .command('type', 'returns the typescript type for the ghf config file')
  .option('-o, --outfile <outfile:string>', 'Outfile to write to (ie: .ghf.type.ts)', { default: '' })
  .action(async ({ outfile }) => {
    const schema = z.toJSONSchema(settingsSchema)
    const type = await compile(schema as unknown as JSONSchema4, 'Config')

    if (outfile) {
      await writeTextFile(outfile, `${type}\n`)
    } else {
      // biome-ignore lint/suspicious/noConsole: this output the schema to the console
      console.log(type)
    }
  })
  .command('settings', 'returns the settings for the ghf config file')
  .option('-o, --outfile <outfile:string>', 'Outfile to write to (ie: .ghf.settings.json)', { default: '' })
  .option('--config <config:string>', 'The configuration file to get the hidden files settings', { default: '' })
  .action(async ({ outfile, config }) => {
    const settings = await loadSettings(config)
    const json = JSON.stringify(settings, null, 2)

    if (outfile) {
      await writeTextFile(outfile, json)
    } else {
      // biome-ignore lint/suspicious/noConsole: this output the schema to the console
      console.log(json)
    }
  })
  .command('init', 'initializes the ghf config file')
  .type('init-format', initFormatType)
  .option('-o, --outfile <outfile:string>', 'Outfile to write to (ie: .ghf.ts)')
  .option('-f, --format <format:init-format>', 'Format of the config file (ts, json, yaml)', { default: 'ts' as InitFormat })
  .action(async ({ outfile, format }) => {
    const resolvedOutfile = outfile ?? defaultFilenames[format]

    if (await fileExists(resolvedOutfile)) {
      throw new Error(`File ${resolvedOutfile} already exists`)
    }

    await writeTextFile(resolvedOutfile, initTemplates[format])
  })
  .parse(Deno.args)
