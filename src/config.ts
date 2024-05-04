import { z } from './deps.ts'

export const configSchema = z
  .object({
    WORKDIR: z.string().default('.'),
  })
  .transform(({ WORKDIR }) => ({
    workdir: WORKDIR,
  }))

export type Config = z.infer<typeof configSchema>

export const getConfig = (config: Partial<Config> = {}) => ({
  ...configSchema.parse(Deno.env.toObject()),
  ...config,
})
