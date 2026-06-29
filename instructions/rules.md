A file must never exceed 800 lines of code. If this is the case, make a refactor and split the file.

## Operating System

**IMPORTANT: This project runs on Windows 10**

- Platform: Windows (win32)
- Shell: bash (Git Bash or similar)
- User: Gino (LENOVO)

### Windows-Specific Commands

When suggesting commands or scripts:
- Use PowerShell or bash (Git Bash) syntax
- DO NOT use macOS-specific commands like `launchctl`
- DO NOT use Linux-specific commands that don't work on Windows
- Use Windows paths: `C:\Users\LENOVO\...` or relative paths
- For process management, use Task Manager or PowerShell commands
- The wc (word count) command is a Unix/Linux utility and is not natively available in the standard Windows Command Prompt (CMD) or PowerShell.

## Package Manager

Always use `bun` instead of `npm` for all commands:
- `bun install` (not `npm install`)
- `bun run dev` (not `npm run dev`)
- `bun run build` (not `npm run build`)
- `bun add <package>` (not `npm install <package>`)

- Let me do the `bun run dev` or `bun start` because you have the tendency to do multiple of these and you open too many servers or processes.

## Web Search When Uncertain

When you don't know something or are uncertain about information:
- Use web search tools proactively to find accurate, current information
- Don't guess or make assumptions when you can verify
- Search for documentation, specifications, or authoritative sources
- Example: If asked "what is X?" and you're not certain, search the web first

## Project Organization & Note-Taking

### Note-Taking Best Practices

1. **Always add a date** - Use format: (YYYY-MM-DD) or (Month DD, YYYY)
2. **Use clear section headers** - Makes it easy to find later
3. **Be specific** - Include context, not just "fix the thing"
4. **Link related items** - Reference other files or sections when relevant
5. **Keep it organized** - Group related ideas together

### Avoid

- Scattered notes in random files
- Notes without dates
- Vague descriptions ("fix the bug")
- Duplicate information across files
- Notes in code comments that should be in docs

## Git & GitHub

**ABSOLUTE RULES:**
- NEVER do `git checkout` to another branch unless the user explicitly asks for it
- For a GitHub backup: commit + push from the current branch, period. Do not switch branches.
- `git checkout` changes files on disk — it breaks work in progress
- The user prefers working on main and committing when he's ready
- If we create a backup branch, stay on it after the push

## CodeMirror Widget CSS — No Margins

**NEVER use `margin` on CodeMirror widget replacements** (decoration widgets, block widgets, inline replaced elements in `.cm-content`).

CodeMirror 6 computes line/block heights for cursor positioning and text selection based on the element's box size. Margins live *outside* the box and are invisible to CM6's height calculations. This causes text selection to be offset by the margin amount (typically one line off).

**Rule:** Always use `padding` instead of `margin` for spacing around CM6 widgets. If the padding causes background bleed, add `background-clip: content-box`.

This applies to all widget CSS in `rich-preview.css` and any future CM6 decoration styles.
