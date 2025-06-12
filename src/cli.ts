/**
 * @module
 *
 * This module contains the command line interface for the ghf cli.
 *
 */
import { compile } from 'npm:json-schema-to-typescript'
import data from '../deno.json' with { type: 'json' }
import { getConfig } from './config.ts'
import { Command, z } from './deps.ts'
import { applyPlans } from './plan.ts'
import { planRules } from './rules/index.ts'
import { loadSettings, settingsSchema } from './settings.ts'

type JSONSchema4 = Parameters<typeof compile>[0]

await new Command()
  .name('ghf')
  .version(data.version)
  .description('Command line to use the ghf cli')
  .command('apply', 'apply the git hidden files')
  .option('-d, --dir <dir:string>', 'Directory to apply hidden files', { default: '.' })
  .option('--dry-run', 'Run the apply command without applying changes', { default: false })
  .option('--config <config:string>', 'The configuration file to get the hidden files settings', { default: '.ghf.json' })
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
      await Deno.writeTextFile(outfile, json)
    } else {
      // biome-ignore lint/suspicious/noConsoleLog: this output the schema to the console
      console.log(json)
    }
  })
  .command('type', 'returns the typescript type for the ghf config file')
  .option('-o, --outfile <outfile:string>', 'Outfile to write to (ie: .ghf.type.ts)', { default: '' })
  .action(async ({ outfile }) => {
    const schema = z.toJSONSchema(settingsSchema)
    const type = await compile(schema as unknown as JSONSchema4, 'Config')

    if (outfile) {
      await Deno.writeTextFile(outfile, type)
    } else {
      // biome-ignore lint/suspicious/noConsoleLog: this output the schema to the console
      console.log(type)
    }
  })
  .parse(Deno.args)
