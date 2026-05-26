import { assert, assertEquals } from 'jsr:@std/assert'
import { fromFileUrl, join } from 'jsr:@std/path@1.1.0'
import { planRules } from '../src/rules/index.ts'
import { loadSettings } from '../src/settings.ts'

const fixtureDir = fromFileUrl(new URL('./', import.meta.url))
const fixtureConfig = join(fixtureDir, '.ghf.json')
const fixtureLicense = join(fixtureDir, 'data', 'LICENSE')

Deno.test('test/.ghf.json: plans a LICENSE create from test/data/LICENSE', async () => {
  const expected = await Deno.readTextFile(fixtureLicense)
  const tempDir = await Deno.makeTempDir({ prefix: 'ghf-fixture-' })
  const originalCwd = Deno.cwd()

  try {
    await Deno.mkdir(join(tempDir, 'test', 'data'), { recursive: true })
    await Deno.copyFile(fixtureConfig, join(tempDir, '.ghf.json'))
    await Deno.copyFile(fixtureLicense, join(tempDir, 'test', 'data', 'LICENSE'))

    Deno.chdir(tempDir)

    const settings = await loadSettings('.ghf.json')
    const plans = await planRules(settings)

    const licensePlan = plans.find(plan => plan.path === 'LICENSE')
    assert(licensePlan, 'expected a plan targeting LICENSE')

    const planned = licensePlan.type === 'create' ? licensePlan.content : licensePlan.type === 'update' ? licensePlan.new : null
    assertEquals(planned, expected)
  } finally {
    Deno.chdir(originalCwd)
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('test/.ghf.json: parses with a single file rule pointing at test/data/LICENSE', async () => {
  const settings = await loadSettings(fixtureConfig)
  const fileRules = (settings.rules ?? []).filter(rule => rule.type === 'file')

  assertEquals(fileRules.length, 1)

  const [rule] = fileRules
  assertEquals(rule.path, 'LICENSE')
  assertEquals(rule.content, { path: 'test/data/LICENSE' })
})
