import { z } from './deps.ts'

export const contentSchema = z.union([
  z.object({
    path: z.string(),
  }),
  z.object({
    url: z.string(),
  }),
  z.string(),
])

type Content = z.infer<typeof contentSchema>

export const loadContent = async (content: Content) => {
  if (typeof content === 'string') {
    return content
  }

  if ('url' in content) {
    const response = await fetch(content.url)
    return response.text()
  }

  return Deno.readTextFile(content.path)
}
