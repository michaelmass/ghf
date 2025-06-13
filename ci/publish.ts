import { connect } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { publish } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/deno.ts'
import { getDirectory } from './util.ts'

await connect(async client => {
  const dir = getDirectory(client)
  await publish({ client, dir })
})
