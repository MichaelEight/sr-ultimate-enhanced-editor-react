# Git Branch Management Guide

### Scenario
- Branches: `main`, `dev`, `feat/ABC`
- Goal: Update `dev` with `main`, merge `dev` to `main` without deleting `dev`, and allow easy reversion on `main`.

### Step-by-Step Guide

1. **Rebase `feat/ABC` onto `dev`**:
   ```sh
   git checkout feat/ABC
   git rebase dev
   ```
   - Keeps `feat/ABC` up to date with the latest `dev`.

2. **Merge `feat/ABC` to `dev`**:
   ```sh
   git checkout dev
   git merge feat/ABC
   ```
   - Use `--no-ff` if you want to keep the history intact.

3. **Rebase `dev` onto `main`**:
   ```sh
   git checkout dev
   git rebase main
   ```
   - Brings `dev` up to date with the latest `main`.

4. **Merge `dev` into `main` with a merge commit**:
   ```sh
   git checkout main
   git merge --no-ff dev -m "Merge dev branch"
   ```
   - Creates a merge commit to clearly mark the merge point.

5. **Push the branches**:
   ```sh
   git push origin main
   git push origin dev
   ```
   - Ensures changes are updated in the remote repository.

6. **Revert the merge on `main` if needed**:
   ```sh
   git checkout main
   git revert -m 1 <merge_commit_hash>
   ```
   - Use `-m 1` to revert the merge commit.
   - Find `<merge_commit_hash>` via `git log`.

### Summary
- **Rebase** keeps history linear and up to date.
- **Merge with `--no-ff`** creates a clear merge point.
- **Revert** (`-m 1`) allows for easy undoing of the merge.