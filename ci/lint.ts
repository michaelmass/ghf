import { connect } from 'https://raw.githubusercontent.com/michaelmass/pipelines/master/dagger/dagger.ts'
import { getDirectory, lint } from './util.ts'

await connect(async client => {
  const dir = getDirectory(client)
  await lint({ client, dir })
})
