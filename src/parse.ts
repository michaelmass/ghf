import * as esbuild from 'npm:esbuild@0.25.5'
import { encodeBase64 } from 'jsr:@std/encoding@1.0.10/base64'
import { parseYaml } from './deps.ts'

function tseval(code: string) {
  return import(`data:application/typescript;charset=utf-8;base64,${encodeBase64(code)}`)
}

const getFromJs = async (code: string) => {
  const result = await tseval(code)
  return result.default
}

const getFromTs = async (code: string) => {
  const { outputFiles } = await esbuild.build({
    stdin: { contents: code, loader: 'ts' },
    outfile: undefined,
    write: false,
    format: 'esm',
  })

  const artifact = outputFiles[0]

  if (!artifact) {
    throw new Error('Failed to build ts file')
  }

  return getFromJs(artifact.text)
}

const parseFuncs = {
  yaml: parseYaml,
  yml: parseYaml,
  json: JSON.parse,
  js: getFromJs,
  ts: getFromTs,
} as const satisfies Record<string, (content: string) => Promise<unknown> | unknown>

type ContentType = keyof typeof parseFuncs

export const parse = async (content: string, type: string) => {
  const parseFunc = parseFuncs[type as ContentType]

  if (!parseFunc) {
    throw new Error(`Unsupported content type: ${type}`)
  }

  const parsed = await parseFunc(content)

  return parsed
}
