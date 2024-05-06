import { parseYaml } from './deps.ts'

const parseFuncs = {
  yaml: parseYaml,
  yml: parseYaml,
  json: JSON.parse,
} as const satisfies Record<string, (content: string) => unknown>

type ContentType = keyof typeof parseFuncs

export const parse = (content: string, type: string) => {
  const parseFunc = parseFuncs[type as ContentType]

  if (!parseFunc) {
    throw new Error(`Unsupported content type: ${type}`)
  }

  return parseFunc(content)
}
