/**
 * @module
 *
 * This module contains the command line interface for the ghf cli.
 *
 */
import data from '../deno.json' with { type: 'json' }
import { getConfig } from './config.ts'
import { Command } from './deps.ts'
import { planRules } from './rules/index.ts'
import { loadSettings } from './settings.ts'
import { applyPlans } from './plan.ts'

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
  .parse(Deno.args)
