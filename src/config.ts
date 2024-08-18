import { z } from './deps.ts'

export const configSchema = z
  .object({
    WORKDIR: z.string().default('.'),
    DRY_RUN: z.string().default('false'),
    CONFIG_FILE: z.string().default('.ghf.json'),
  })
  .transform(({ WORKDIR, DRY_RUN, CONFIG_FILE }) => ({
    dir: WORKDIR,
    dryRun: DRY_RUN === 'true',
    config: CONFIG_FILE,
  }))

export type Config = z.infer<typeof configSchema>

export const getConfig = (config: Partial<Config> = {}) => ({
  ...configSchema.parse(Deno.env.toObject()),
  ...config,
})
