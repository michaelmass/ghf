import { dirname } from 'jsr:@std/path'

export async function fileExists(path: string): Promise<boolean> {
  try {
    const stat = await Deno.stat(path)
    return stat.isFile
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return false
    }
    throw error
  }
}

export async function writeTextFile(filepath: string, content: string) {
  const dir = dirname(filepath)
  await Deno.mkdir(dir, { recursive: true })
  await Deno.writeTextFile(filepath, content)
}

export async function removeIfExists(filepath: string) {
  if (await fileExists(filepath)) {
    await Deno.remove(filepath)
  }
}
