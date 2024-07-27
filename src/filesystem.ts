/**
 * A simple intermediate layer to interact with the file system in a more controlled way.
 * The FileSystem never writes to the disk, it only writes to an in-memory object.
 */
export type FileSystem = {
  /**
   * fetch the content of a file in memory if it doesn't exist it will fetch the content
   * @param path the path to the file
   * @returns the content of the file or undefined if the file does not exist
   */
  fetch: (path: string) => Promise<string | undefined> | (string | undefined)
  /**
   * write the content of a file to the in-memory file system
   * @param path the path to the file
   * @param content the content of the file
   */
  write: (path: string, content: string) => Promise<void> | void
  /**
   * delete the file from the in-memory file system by setting its content to null
   * @param path the path to the file
   */
  delete: (path: string) => Promise<void> | void
  /**
   * reset the file to its initial state
   * @param path the path to the file
   */
  reset: (path: string) => Promise<void> | void
  /**
   * read the content of a file in memory if it doesn't exist it will return undefined and null if it was deleted
   * @param path the path to the file
   * @returns the content of the file or null if the file was deleted
   */
  read: (path: string) => Promise<string | null | undefined> | (string | null | undefined)
  /**
   * entries in the file system
   * @returns an array of entries in the file system
   */
  entries: () => Promise<[string, string | null][]> | [string, string | null][]
}

export const FileSystem = (): FileSystem => {
  const fileSystem: Record<string, string | null> = {}

  return {
    fetch: async (path: string) => fileSystem[path] ?? (await Deno.readTextFile(path).catch(() => undefined)),
    reset: (path: string) => void delete fileSystem[path],
    entries: () => Object.entries(fileSystem),
    read: (path: string) => fileSystem[path],
    write: (path: string, content: string) => {
      fileSystem[path] = content
    },
    delete: (path: string) => {
      fileSystem[path] = null
    },
  }
}
