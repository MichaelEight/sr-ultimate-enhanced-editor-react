# Git Hooks

This directory contains git hooks that enforce development policies.

## Installation

Run the installation script to copy hooks to your local `.git/hooks` directory:

```bash
./scripts/install-hooks.sh
```

## Available Hooks

### pre-push

Enforces the following policies:
- **Blocks direct pushes to `main` branch** - The main branch is reserved for releases only
- **Validates branch naming convention** - Ensures branches follow `prefix/description` format
- **Enforces dev-first workflow** - All development should start from `dev` branch

## Why are hooks in `.githooks` and not `.git/hooks`?

Git hooks in `.git/hooks` are **not tracked by git** (they're in `.gitignore` by default). By keeping our hooks in `.githooks`, we can:

1. Track them in version control
2. Share them with all team members
3. Update them easily across the team
4. Document our development policies in code

Team members need to run `./scripts/install-hooks.sh` after cloning the repository to activate the hooks.

## Bypassing Hooks (Emergency Only)

If you absolutely need to bypass the pre-push hook (emergency situations only):

```bash
git push --no-verify
```

**Warning:** Only use `--no-verify` if you have a valid reason and understand the policy you're bypassing.

## See Also

- [CONTRIBUTING.md](../CONTRIBUTING.md) - Complete development workflow guide
- [.branchconfig.json](../.branchconfig.json) - Branch policy configuration
