import type { FileSystem } from './filesystem.ts'

export const TestFileSystem = (records: Record<string, string | null> = {}): FileSystem => {
  const fileSystem: Record<string, string | null> = {}

  return {
    fetch: (path: string) => fileSystem[path] ?? records[path] ?? undefined,
    write: (path: string, content: string) => {
      fileSystem[path] = content
    },
    delete: (path: string) => {
      fileSystem[path] = null
    },
    reset: (path: string) => {
      delete fileSystem[path]
    },
    entries: () => Object.entries(fileSystem),
    read: (path: string) => fileSystem[path],
  }
}
