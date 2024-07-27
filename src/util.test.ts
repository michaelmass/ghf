import type { FileSystem } from './filesystem.ts'

export const TestFileSystem = (records: Record<string, string | null> = {}): FileSystem => {
  const fileSystem: Record<string, string | null> = {}

  return {
    entries: () => Object.entries(fileSystem),
    read: (path: string) => fileSystem[path],
    fetch: (path: string) => fileSystem[path] ?? records[path] ?? undefined,
    reset: (path: string) => void delete fileSystem[path],
    write: (path: string, content: string) => {
      fileSystem[path] = content
    },
    delete: (path: string) => {
      fileSystem[path] = null
    },
  }
}
