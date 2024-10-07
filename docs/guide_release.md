# Release Guide

This guide explains the steps to make a release from the project. Follow these steps to ensure a smooth release process with version control, tagging, and proper commit history.

## 1. Update Version Number

Before making a release, update the version number in relevant files (e.g., `package.json`, `pyproject.toml`, `config.py`).

- Use [Semantic Versioning](https://semver.org/) (e.g., `1.0.0` for major releases, `1.0.1` for patches).
- Update the version in these places:
  - Backend configuration file: `config.py`
  - Frontend package file: `package.json`

Example:
```json
// package.json
{
  "version": "1.0.0"
}
```

## 2. Commit Changes

After updating the version number, commit the changes using Git.

### Commands:

```bash
git add .
git commit -m "chore(release): prepare for release v1.0.0"
```

This ensures all your changes, including the version update, are tracked.

## 3. Push Changes

Push your changes to the remote repository.

```bash
git push origin main
```

Replace `main` with the name of your default branch if it's different.

## 4. Create a Release Tag

Tag the release with the version number using Git tags. Tags help mark a specific point in the Git history as a release.

### Commands:

```bash
git tag -a v1.0.0 -m "Release version 1.0.0"
```

Make sure to replace `v1.0.0` with the actual version number.

- `-a v1.0.0`: Creates an annotated tag named `v1.0.0`.
- `-m "Release version 1.0.0"`: Adds a message describing the release.

### Push the Tag:

```bash
git push origin v1.0.0
```

This pushes the new release tag to the remote repository.

## 5. Prepare the Release on GitHub/GitLab

### GitHub

1. Navigate to the "Releases" tab in your repository.
2. Click "Draft a new release."
3. Select the tag you just pushed (e.g., `v1.0.0`).
4. Fill in the release title (e.g., "Release 1.0.0") and description (summarize changes, fixes, and features).
5. Click "Publish release."

### GitLab

1. Navigate to the "Tags" section of your repository.
2. Click "New release."
3. Select the tag you created (e.g., `v1.0.0`).
4. Provide a release title and description.
5. Click "Create release."

## 6. Review the Release

After publishing, verify that:

1. The tag and release are listed correctly on GitHub/GitLab.
2. The version number is correct in all related files.
3. Test any release artifacts, such as `.zip` files or container images, if applicable.

## 7. Post-Release Cleanup

### If necessary, delete temporary branches used for development or hotfixes:

```bash
git branch -d <branch_name>
```

Ensure you have merged or rebased all your changes before deleting branches.

---

### Additional Information:

- **Branch Naming Convention**: Use consistent branch names like `feature/<name>`, `bugfix/<name>`, or `release/<version>` for clarity.
- **Versioning**: Stick to [Semantic Versioning](https://semver.org/) to clearly communicate the nature of changes in each release (e.g., major, minor, patch).
- **Testing**: Ensure that all tests pass before starting the release process.
