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

### Liscense

[MIT](LICENSE)
