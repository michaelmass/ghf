import { z } from './deps.ts'
import { fetchText } from './url.ts'

export const contentSchema = z.union([
  z.object({
    path: z.string(),
  }),
  z.object({
    url: z.string(),
  }),
  z.string(),
])

export type Content = z.infer<typeof contentSchema>

export const loadContent = (content: Content) => {
  if (typeof content === 'string') {
    return content
  }

  if ('url' in content) {
    return fetchText(content.url)
  }

  return Deno.readTextFile(content.path)
}
