export type FileSystem = ReturnType<typeof FileSystem>

export const FileSystem = () => {
  const fileSystem: Record<string, string | null> = {}

  return {
    read: async (path: string) => {
      if (!fileSystem[path]) {
        const content = await Deno.readTextFile(path).catch(() => undefined)

        if (content === undefined) {
          return
        }

        fileSystem[path] = content
      }

      return fileSystem[path]
    },
    write: (path: string, content: string) => {
      fileSystem[path] = content
    },
    delete: (path: string) => {
      fileSystem[path] = null
    },
    reset: (path: string) => {
      delete fileSystem[path]
    },
    entries: () => {
      return Object.entries(fileSystem)
    },
  }
}
