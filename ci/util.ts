import { lint as biomeLint, fmt } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/biome.ts'
import type { Client, Directory } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { check } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/deno.ts'

export function getDirectory(client: Client) {
  return client.host().directory('.', { exclude: ['.git', '.github', 'node_modules', 'ci'] })
}

export async function lint(params: { client: Client; dir: Directory }) {
  await biomeLint(params)
  await fmt(params)
  await check({ ...params, entrypoints: ['src/cli.ts'] })
}
