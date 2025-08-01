/**
 * @module
 *
 * This module contains the command line interface for the ghf cli.
 *
 */
import { compile } from 'npm:json-schema-to-typescript@15.0.4'
import data from '../deno.json' with { type: 'json' }
import { getConfig } from './config.ts'
import { Command, z } from './deps.ts'
import { fileExists, writeTextFile } from './fs.ts'
import { applyPlans } from './plan.ts'
import { planRules } from './rules/index.ts'
import { loadSettings, settingsSchema } from './settings.ts'

const defaultConfig = `import type { Config } from './.ghf.type'

export default {
  extends: ['https://michaelmass.github.io/ghf/ghf.default.json'],
} satisfies Config`

type JSONSchema4 = Parameters<typeof compile>[0]

await new Command()
  .name('ghf')
  .version(data.version)
  .description('Command line to use the ghf cli')
  .command('apply', 'apply the git hidden files')
  .option('-d, --dir <dir:string>', 'Directory to apply hidden files', { default: '.' })
  .option('--dry-run', 'Run the apply command without applying changes', { default: false })
  .option('--config <config:string>', 'The configuration file to get the hidden files settings', { default: '' })
  .action(async options => {
    const config = getConfig(options)
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
  .option('-o, --outfile <outfile:string>', 'Outfile to write to (ie: .ghf.ts)', { default: '.ghf.ts' })
  .action(async ({ outfile }) => {
    if (await fileExists(outfile)) {
      throw new Error(`File ${outfile} already exists`)
    }

    await writeTextFile(outfile, defaultConfig)
  })
  .parse(Deno.args)
