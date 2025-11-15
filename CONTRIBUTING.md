# Contributing Guidelines

## Branching Strategy

This project follows a **dev-first branching strategy**:

- **`main`** - Release branch (protected, no direct pushes)
- **`dev`** - Main development branch (all features merge here first)
- **Feature branches** - Created from `dev` for new work

### Workflow Overview

```
main (releases only)
  ↑
  │ (merge for releases)
  │
dev (main development)
  ↑
  │ (PRs from feature branches)
  │
feat/*, fix/*, refactor/*, etc.
```

## Creating a New Feature or Fix

### 1. Start from `dev` branch

```bash
# Ensure you have the latest dev branch
git checkout dev
git pull origin dev

# Create your feature branch
git checkout -b feat/your-feature-name
# or for bug fixes:
git checkout -b fix/bug-description
```

### 2. Branch Naming Convention

All branches must follow this format: `prefix/description`

**Allowed Prefixes:**
- `feat/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks
- `style/` - Code style changes (formatting, etc.)
- `perf/` - Performance improvements
- `ci/` - CI/CD changes
- `build/` - Build system changes
- `revert/` - Reverting previous changes

**Examples:**
```bash
feat/user-authentication
fix/login-validation-error
refactor/api-client-structure
docs/readme-update
test/add-unit-tests
```

### 3. Make Your Changes

```bash
# Make your changes
# ...

# Stage and commit
git add .
git commit -m "feat: add user authentication system"
```

### 4. Push Your Branch

```bash
# Push to remote
git push -u origin feat/your-feature-name
```

### 5. Create a Pull Request

- Create a PR from your feature branch → `dev`
- **Never create PRs directly to `main`**
- Request review from team members
- Address any feedback

### 6. After Merge

```bash
# Delete your local feature branch
git checkout dev
git branch -d feat/your-feature-name

# Delete remote branch (if not auto-deleted)
git push origin --delete feat/your-feature-name
```

## Release Process

Only maintainers should merge `dev` → `main` for releases:

```bash
# Create a release
git checkout main
git pull origin main
git merge dev
git push origin main

# Tag the release
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## Protected Branches

### `main` Branch
- **Purpose:** Production releases only
- **Direct pushes:** ❌ Blocked by git hooks
- **Changes via:** PR from `dev` only
- **Managed by:** Maintainers

### `dev` Branch
- **Purpose:** Main development branch
- **Direct pushes:** ❌ Not recommended
- **Changes via:** PRs from feature branches
- **Managed by:** Team

## Commit Message Guidelines

Keep commit messages **short and concise** - single line format:

```
[prefix]: [short summary of changes]
```

**Examples:**
```
feat: Add user login functionality
fix: Bug with dropdown input labels
refactor: Simplify database query logic
docs: Update API documentation
test: Add integration tests for user service
feat: Add unit handling to ORBAT tab
```

**Format Rules:**
- Single line only (no multi-line commits)
- Start with lowercase prefix (feat, fix, refactor, etc.)
- Brief, clear summary of what changed
- No period at the end

## Git Hooks

This repository includes git hooks to enforce policies:

### Pre-Push Hook
- Prevents direct pushes to `main` branch
- Validates branch naming conventions
- Provides helpful error messages

If you see an error when pushing, read the message carefully - it will guide you to the correct workflow.

## Branch Policy Configuration

The `.branchconfig.json` file defines the branching strategy and rules. This file is used by:
- Development tools
- CI/CD pipelines
- Git hooks
- Documentation

## Questions?

If you're unsure about the workflow:
1. Check `.branchconfig.json` for the current policy
2. Read this CONTRIBUTING.md guide
3. Ask a team member or maintainer

## Summary Checklist

- [ ] Always branch from `dev`
- [ ] Use conventional branch prefixes (feat/, fix/, etc.)
- [ ] Never push directly to `main`
- [ ] Create PRs to merge into `dev`
- [ ] Delete feature branches after merge
- [ ] Keep commits clean and descriptive
