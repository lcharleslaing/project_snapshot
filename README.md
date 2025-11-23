# 📸 project-snapshots

> Create complete project snapshots with file trees and contents, automatically excluding gitignored files.

`project-snapshots` is a powerful CLI tool that generates comprehensive markdown snapshots of your project's current state. Perfect for creating backups, documenting project states, or tracking changes over time.

## ✨ Features

- 🎯 **Smart Project Detection** - Automatically finds your project root by walking up from the current directory
- 📁 **Complete File Trees** - Beautiful ASCII tree structure showing your project layout
- 📝 **Full File Contents** - Includes the actual content of all files (respects size limits)
- 🚫 **Gitignore Aware** - Automatically excludes files and directories listed in `.gitignore`
- 📅 **Date-Organized** - Snapshots are organized by date in folders (e.g., `Sat-11-22-2025`)
- 🔄 **Works Everywhere** - Works as a local devDependency, via `npx`, or globally installed
- ⚡ **Zero Configuration** - Just install and run, no setup required

## 🚀 Installation

### As a devDependency (Recommended)

```bash
npm install --save-dev project-snapshots
```

Then add to your `package.json`:

```json
{
  "scripts": {
    "snap": "snap"
  }
}
```

### Global Installation

```bash
npm install -g project-snapshots
```

### Via npx (No Installation)

```bash
npx project-snapshots
```

## 📖 Usage

### Basic Usage

From your project root directory:

```bash
npm run snap
```

Or if installed globally:

```bash
snap
```

Or via npx:

```bash
npx project-snapshots
```

### How It Works

1. **Project Detection**: The tool starts from your current working directory (`process.cwd()`) and walks upward to find the nearest directory containing `package.json`. This becomes your project root.

2. **Snapshot Creation**: Creates a `snapshots` directory in your project root (if it doesn't exist).

3. **File Scanning**: Recursively scans all files in your project, respecting `.gitignore` patterns.

4. **Markdown Generation**: Creates a comprehensive markdown file with:
   - Project name (normalized from directory name)
   - Snapshot date and time
   - Complete file tree structure
   - Full contents of all files

5. **Organization**: Saves snapshots in date-organized folders:
   ```
   snapshots/
   └── Sat-11-22-2025/
       └── snap-Sat-11-22-2025--5-55-am.md
   ```

## 📁 Output Structure

Snapshots are saved in the following structure:

```
your-project/
├── snapshots/
│   ├── Sat-11-22-2025/
│   │   ├── snap-Sat-11-22-2025--5-55-am.md
│   │   └── snap-Sat-11-22-2025--2-30-pm.md
│   └── Sun-11-23-2025/
│       └── snap-Sun-11-23-2025--9-15-am.md
└── ...
```

## 📄 Snapshot Format

Each snapshot markdown file includes:

1. **Header**: Project name and snapshot date/time
2. **File Tree**: Visual ASCII tree of your project structure
3. **File Contents**: Complete content of all files (files over 100KB are truncated)

Example snapshot structure:

```markdown
# Your Project Name

**Snapshot Date:** Sat, November 22, 2025 @ 5:55am

---

## File Tree

```
your-project
├── src/
│   ├── index.js
│   └── utils.js
├── package.json
└── README.md
```

---

## File Contents

### src/index.js

```javascript
// Your file content here...
```

### package.json

```json
{
  "name": "your-project",
  ...
}
```

...
```

## 🎯 Use Cases

- **Project Backups**: Create snapshots before major refactoring
- **Documentation**: Generate complete project documentation at any point
- **Code Reviews**: Share project state with team members
- **Version Tracking**: Track project evolution over time
- **Debugging**: Capture project state when investigating issues
- **Onboarding**: Help new team members understand project structure

## 🔧 Configuration

The tool automatically:

- **Respects `.gitignore`**: All patterns in your `.gitignore` are automatically excluded
- **Excludes snapshots**: The `snapshots` directory itself is always excluded to prevent recursion
- **Handles large files**: Files over 100KB are truncated with a size indicator
- **Detects project root**: Works regardless of where the script is located

## 💡 Examples

### Example 1: Before Major Refactor

```bash
# Create a snapshot before refactoring
npm run snap

# ... do your refactoring ...

# Create another snapshot after
npm run snap
```

### Example 2: Documenting Milestones

```bash
# After completing a feature
npm run snap

# The snapshot captures the exact state
# Perfect for documenting milestones
```

### Example 3: Sharing Project State

```bash
# Create a snapshot to share with team
npm run snap

# Share the generated markdown file
# Contains complete project structure and code
```

## 🛠️ Requirements

- Node.js >= 12.0.0
- A project with a `package.json` file (optional, but recommended)

## 📝 Notes

- The tool always starts from your **current working directory** (`process.cwd()`), not from where the script is installed
- If no `package.json` is found while walking up the directory tree, the current working directory is used as the project root
- The `snapshots` directory is automatically created if it doesn't exist
- Binary files and files over 100KB are handled gracefully

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

ISC

## 🔗 Links

- [npm package](https://www.npmjs.com/package/project-snapshots)

---

**Made with ❤️ for developers who want to capture their project's state**
