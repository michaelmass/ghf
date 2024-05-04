/**
 * @module
 *
 * This module contains the command line interface for the ghf cli.
 *
 */
import data from '../deno.json' with { type: 'json' }
import { getConfig } from './config.ts'
import { Command } from './deps.ts'

await new Command()
  .name('ghf')
  .version(data.version)
  .description('Command line to use the ghf cli')
  .command('apply', 'apply the git hidden files')
  .action(() => {
    const config = getConfig()
    console.log('apply', config)
  })
  .parse(Deno.args)
