# Issue Creation and Workflow Guide

This guide explains how to create a new issue, assign it, and start working on it in a structured way. Follow these steps to ensure that issues are well-documented, properly tracked, and efficiently managed during development.

## 1. Create a New Issue

When you encounter a bug, have a feature request, or need to track any task, the first step is to create an issue.

### GitHub

1. Go to the "Issues" tab in your repository.
2. Click "New issue."
3. Choose between:
   - **Bug report**: To report a bug or error.
   - **Feature request**: To request a new feature.
   - **Custom issue template**: If your repository has a custom issue template.
   
4. Fill in the issue details:
   - **Title**: Short and descriptive.
     - Example: `fix(auth): resolve login redirect loop`
     - Example: `feat(dashboard): add user activity graphs`
   - **Description**: Describe the issue in detail. Provide steps to reproduce the bug or explain the feature request clearly.
     - For **bug reports**:
       - Steps to reproduce
       - Expected behavior
       - Actual behavior
       - Screenshots (if applicable)
     - For **feature requests**:
       - Why the feature is necessary
       - Expected behavior or outcome
       - Relevant links or inspiration
   - **Additional Fields**: Add labels like `bug`, `feature`, `enhancement`, `documentation`, etc., to categorize the issue.
   - **Assignees**: Assign the issue to yourself or the relevant person if you know who will handle it.
   
5. Click "Submit new issue."

### GitLab

1. Go to the "Issues" section in your GitLab repository.
2. Click "New issue."
3. Fill in the title and description, similar to the instructions above.
4. Optionally, assign the issue to yourself or another team member.
5. Apply relevant labels to categorize the issue.
6. Click "Submit issue."

### Example Issue Template:

```markdown
### Description:
There is a redirect loop in the login flow when the user logs in and gets redirected back to the login page.

### Steps to Reproduce:
1. Navigate to `/login`
2. Enter valid credentials
3. Observe the redirect loop after login

### Expected Behavior:
The user should be redirected to the dashboard after successful login.

### Actual Behavior:
The user is redirected back to the login page.

### Environment:
- Browser: Chrome v91
- Operating System: macOS Big Sur

### Additional Context:
Error occurs after the OAuth2 login feature was implemented.
```

---

## 2. Assign and Prioritize the Issue

After creating the issue, it’s important to categorize and prioritize it:

1. **Assign**: Assign the issue to yourself or another developer.
2. **Labels**: Apply relevant labels like:
   - **bug**, **feature**, **enhancement**, **documentation**
   - Priority levels: **low**, **medium**, **high**
   - Status labels: **in-progress**, **blocked**
   
3. **Milestone**: If the issue is part of a larger release or milestone, link the issue to the relevant milestone.

---

## 3. Start Working on the Issue

Once the issue is created and assigned, follow these steps to begin working on it.

### 3.1 Create a New Branch for the Issue

Always create a new branch to work on an issue. This ensures that your work is isolated and can be merged without affecting the main codebase.

### Branch Naming Convention:

- Use a consistent naming convention based on the type of issue:
  - For bugs: `bugfix/<issue-id>-<short-description>`
  - For features: `feature/<issue-id>-<short-description>`
  - For tasks: `task/<issue-id>-<short-description>`

### Commands:

```bash
git checkout -b bugfix/123-fix-login-loop
```

- `bugfix/123-fix-login-loop` indicates this branch is related to bug #123 and briefly describes the issue.

---

## 4. Make Your Changes

Now that your branch is created, begin working on the issue. Regularly commit your work to track progress.

### 4.1 Staging Your Changes

After making changes, stage the files for commit.

```bash
git add .
```

Or add specific files:

```bash
git add path/to/file
```

### 4.2 Writing a Descriptive Commit Message

Write a clear commit message that references the issue and describes the changes.

### Commit Message Format:

1. **Type**: The nature of the commit (e.g., `fix`, `feat`, `chore`, `docs`).
2. **Scope** (optional): Module or part of the code affected.
3. **Subject**: A short description of the change.
4. **Reference the Issue ID**: Include the issue number to link the commit with the issue.

### Example:

```bash
git commit -m "fix(auth): resolve login redirect loop #123"
```

For larger changes, include more details:

```bash
git commit -m "fix(auth): resolve login redirect loop #123

Fixes a redirect loop that occurs after the OAuth2 login flow is triggered. The root cause was an incorrect redirect URL.
```

---

## 5. Push Your Changes to the Remote Repository

After committing your changes, push them to the remote repository.

```bash
git push origin bugfix/123-fix-login-loop
```

---

## 6. Create a Pull Request (PR) for the Issue

Once your changes are pushed, create a pull request to review and merge your changes.

### GitHub

1. Navigate to your repository’s **Pull Requests** section.
2. Click "New pull request."
3. Choose the base branch (usually `main`) and the compare branch (your feature/bugfix branch).
4. Fill in the title and description.
   - The title should follow a similar structure to the commit message.
   - The description should summarize the changes made, referencing the issue.
5. Click "Create pull request."

### Example PR Description:

```markdown
### Issue Reference:
Fixes #123

### Summary:
This PR resolves a redirect loop in the login process. After logging in, users were incorrectly redirected back to the login page due to an incorrect OAuth2 callback URL. 

### Changes:
- Updated the OAuth2 callback handler.
- Added unit tests for the login flow.
```

### GitLab

1. Go to "Merge Requests" and click "New merge request."
2. Choose the source branch (your feature/bugfix branch) and the target branch (`main` or the appropriate branch).
3. Provide a title and description.
4. Submit the merge request for review.

---

## 7. Link the Issue with the Pull Request

In the pull request description, make sure to reference the issue number. This automatically links the pull request with the issue and can close the issue once merged.

For GitHub, you can use the following syntax:

```markdown
Fixes #123
```

For GitLab, use:

```markdown
Closes #123
```

This will automatically close the issue when the pull request is merged.

---

## 8. Review, Revise, and Merge

- Wait for code review feedback and make necessary changes.
- Push additional commits to the same branch to update the pull request.
- Once the review is complete, merge the pull request and close the issue.

### Clean Up

Once the issue is resolved and the pull request is merged:

1. **Delete the branch** locally and remotely to keep the repo clean.
   
   ```bash
   git branch -d bugfix/123-fix-login-loop
   git push origin --delete bugfix/123-fix-login-loop
   ```

---

## Additional Tips:

- **Issue Templates**: Use predefined issue templates to ensure consistency and thoroughness when creating new issues.
- **Keep Commits Small**: Break large issues into small, manageable commits to simplify the review process.
- **Keep Branches Focused**: Each branch should focus on a single issue to avoid merge conflicts and keep the codebase clean.