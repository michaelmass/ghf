Git Hidden Files

> Git Hidden Files is a Git utility to manage generated, ignored, and synced files in a Git repository.

This utility is useful when you want to keep a file in sync with all your projects. This will ensure that the file is always up to date and you don't have to manually copy it to all your repositories.

### Example

You want to have a `.gitignore` file synced with all your projects.

Run `ghf init` to scaffold a `.ghf.ts` config (use `--format json` or `--format yaml` if you prefer). The TypeScript config looks like this:

```ts
import type { Config } from './.ghf.type'

export default {
  rules: [
    {
      type: 'lines',
      path: '.gitignore',
      content: 'node_modules\ndist',
    },
  ],
} satisfies Config
```

When you run `ghf apply` (aliases: `ghf sync`, `ghf run`) in your repository, the `.gitignore` file will be updated by adding the `node_modules` and `dist` lines if they are not already present.

The power of this utility lies in having a remote config file that you can update, and all your repositories will be updated automatically.

```ts
export default {
  extends: ['https://raw.githubusercontent.com/username/repo/main/.ghf.json'],
} satisfies Config
```

You can also use the built-in `@ghf` registry to reference the bundled configs without a full URL — `@ghf/default.json` resolves to `https://michaelmass.github.io/ghf/ghf/default.json`.

```ts
export default {
  extends: ['@ghf/default.json'],
} satisfies Config
```

Even better, you can use a remote file directly.

```bash
ghf apply --config=https://raw.githubusercontent.com/username/repo/main/default.json
```

To check what would change without applying, use `ghf apply --dry-run` or `ghf check` (which exits non-zero if there are pending changes — handy for CI).

## Rules

This is the list of all the possible rules that can be used to describe the operations on a folder.

### Delete

`Delete` rule deletes a file in the file system. It can be used to ensure that no file is present.

### File

`File` rule creates a file in the file system with the provided content. This rule will override any existing content in the file.

### init

`init` rule creates a file if the file doesn't exist already. This is usefull to initialised files without replacing existing files.

### lines

`lines` rule appends lines into a file if they don't exist already.

### reset

`reset` rule reset the content of a file if it was modified by previous rules. This rule alone isn't useful but it can ensure nothing is affecting a file.

### merge

`merge` rule merges the structured content of a file with the provided structured content. This will do a merge of data structures like JSON & YAML.

### part

`part` rule ensures a snippet of content is present in a file. The `strategy` option controls where the snippet is checked and inserted: `start` (prepend if missing), `end` (append if missing), or `content` (append if not found anywhere — the default). Unlike `lines`, this is exact-string matching, so it works for multi-line snippets.

## License

[MIT](LICENSE)
