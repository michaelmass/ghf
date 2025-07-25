Git Hidden Files

> Git Hidden Files is a Git utility to manage generated, ignored, and synced files in a Git repository.

This utility is useful when you want to keep a file in sync with all your projects. This will ensure that the file is always up to date and you don't have to manually copy it to all your repositories.

### Example

You want to have a `.gitignore` file synced with all your projects.

The `.ghf.json` file will look like this:

```json
{
  "rules": [
    {
      "type": "lines",
      "path": ".gitignore",
      "content": ["node_modules", "dist"]
    }
  ]
}
```

When you run `ghf sync` in your repository, the `.gitignore` file will be updated by adding the `node_modules` and `dist` lines if they are not already present.

The power of this utility lies in having a remote `.ghf.json` file that you can update, and all your repositories will be updated automatically.

```json
{
  "extends": ["https://raw.githubusercontent.com/username/repo/main/.ghf.json"] // This will be fetched and append the rules to the current rules at the beginning of the array of rules
}
```

Even better, you can use a remote file directly.

```bash
ghf apply --config=https://raw.githubusercontent.com/username/repo/main/ghf.default.json
```

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

### exec

`exec` rule executes a command in the file system. This is useful to execute commands in the file system.

### Liscense

[MIT](LICENSE)
