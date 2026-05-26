/**
 * @module
 *
 * This module contains the command line interface for the ghf cli.
 *
 */
import { basename } from 'jsr:@std/path@1.1.0'
import { compile } from 'npm:json-schema-to-typescript@15.0.4'
import data from '../deno.json' with { type: 'json' }
import { getConfig } from './config.ts'
import { Command, EnumType, z } from './deps.ts'
import { fileExists, writeTextFile } from './fs.ts'
import { log, type LogLevel, logLevels, setLogLevel } from './logger.ts'
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

const renderTsTemplate = (typeImportPath: string) =>
  `import type { Config } from '${typeImportPath}'

export default {
  extends: ['${defaultExtends}'],
} satisfies Config\n`

type JSONSchema4 = Parameters<typeof compile>[0]

const buildConfigType = async () => {
  const schema = z.toJSONSchema(settingsSchema)
  return `${await compile(schema as unknown as JSONSchema4, 'Config')}\n`
}

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
  .option('-d, --dir <dir:string>', 'Directory to apply hidden files (env: WORKDIR)')
  .option('--dry-run', 'Run the apply command without applying changes (env: DRY_RUN=true)')
  .option('--config <config:string>', 'The configuration file to get the hidden files settings (env: CONFIG_FILE)')
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
  .command('check', 'validate the config and report any pending changes without applying them')
  .alias('validate')
  .option('-d, --dir <dir:string>', 'Directory to check hidden files (env: WORKDIR)')
  .option('--config <config:string>', 'The configuration file to get the hidden files settings (env: CONFIG_FILE)')
  .action(async options => {
    setLogLevel(resolveLogLevel(options))
    const config = getConfig(options)
    if (config.dir && config.dir !== '.') {
      Deno.chdir(config.dir)
    }
    const settings = await loadSettings(config.config)
    const plans = await planRules(settings)
    await applyPlans(plans, { dryRun: true })

    if (plans.length > 0) {
      log.error('check', `${plans.length} pending change${plans.length === 1 ? '' : 's'} — run \`ghf apply\` to apply`)
      Deno.exit(1)
    }
  })
  .command('schema', 'returns the json schema for the ghf config file')
  .option('-o, --outfile <outfile:string>', 'Outfile to write to (ie: .ghf.schema.json)', { default: '' })
  .action(async ({ outfile }) => {
    const schema = z.toJSONSchema(settingsSchema, { io: 'input' })
    const json = JSON.stringify(schema, null, 2)

    if (outfile) {
      await writeTextFile(outfile, json)
    } else {
      // oxlint-disable-next-line no-console
      console.log(json)
    }
  })
  .command('type', 'returns the typescript type for the ghf config file')
  .option('-o, --outfile <outfile:string>', 'Outfile to write to (ie: .ghf.type.ts)', { default: '' })
  .action(async ({ outfile }) => {
    const type = await buildConfigType()

    if (outfile) {
      await writeTextFile(outfile, type)
    } else {
      // oxlint-disable-next-line no-console
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
      // oxlint-disable-next-line no-console
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

    if (format === 'ts') {
      const stem = basename(resolvedOutfile).replace(/\.ts$/, '')
      const typeOutfile = resolvedOutfile.replace(/\.ts$/, '.type.ts')

      if (await fileExists(typeOutfile)) {
        throw new Error(`File ${typeOutfile} already exists`)
      }

      const type = await buildConfigType()

      await writeTextFile(typeOutfile, type)
      await writeTextFile(resolvedOutfile, renderTsTemplate(`./${stem}.type.ts`))
      log.positive('created', resolvedOutfile)
      log.positive('created', typeOutfile)
    } else {
      const template = format === 'json' ? `${JSON.stringify({ extends: [defaultExtends] }, null, 2)}\n` : `extends:\n  - ${defaultExtends}\n`
      await writeTextFile(resolvedOutfile, template)
      log.positive('created', resolvedOutfile)
    }
  })
  .parse(Deno.args)
