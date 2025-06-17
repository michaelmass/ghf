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
