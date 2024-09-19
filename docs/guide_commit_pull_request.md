# Commit and Pull Request Guide

This guide explains how to make a commit and submit a pull request in a structured and professional way. Follow these steps to ensure proper version control, commit history, and review process.

## 1. Create a New Branch

Start by creating a new branch for the feature, bugfix, or any other changes you're making.

### Naming Convention

- Use descriptive and consistent names for your branches:
  - For features: `feature/<feature-name>`
  - For bug fixes: `bugfix/<bug-name>`
  - For hotfixes: `hotfix/<hotfix-name>`
  - For refactors: `refactor/<refactor-name>`

### Command:

```bash
git checkout -b feature/my-new-feature
```

This creates and switches to a new branch named `feature/my-new-feature`.

## 2. Make Changes

Make the necessary code changes in your new branch. Ensure you follow best practices such as keeping your changes modular and committing frequently.

## 3. Stage the Changes

Once you’ve made your changes, you need to stage the files for commit. You can either stage all the files or only specific ones.

### Commands:

- To stage all changes:
  ```bash
  git add .
  ```

- To stage specific files:
  ```bash
  git add path/to/file
  ```

## 4. Write a Meaningful Commit Message

Write clear, concise, and professional commit messages that explain the intent of the changes. Use the following format:

### Commit Message Structure

1. **Type**: A keyword indicating the type of change (e.g., `feat`, `fix`, `docs`, `chore`).
2. **Scope** (optional): The area or module of the project affected.
3. **Subject**: A short description of the change (imperative form).
4. **Body** (optional): A more detailed explanation, if necessary.

### Example:

```bash
git commit -m "feat(auth): add OAuth2 support for third-party login"
```

For larger commits, add a detailed message:

```bash
git commit -m "feat(auth): add OAuth2 support for third-party login

This commit implements OAuth2 for third-party authentication, supporting Google and Facebook. The `auth.py` module has been refactored to handle multiple providers.
```

### Common Commit Types:
- **feat**: A new feature
- **fix**: A bug fix
- **docs**: Documentation changes
- **style**: Code formatting, no logic changes
- **refactor**: Code refactoring without adding new features or fixing bugs
- **test**: Adding or modifying tests
- **chore**: Miscellaneous tasks, such as build process updates

## 5. Push Changes to Remote Repository

Once you’ve committed your changes, push your branch to the remote repository.

### Command:

```bash
git push origin feature/my-new-feature
```

Replace `feature/my-new-feature` with the actual name of your branch.

## 6. Create a Pull Request (PR)

Once your branch is pushed, create a pull request to merge your changes into the main branch (or the appropriate target branch).

### GitHub:

1. Go to your repository on GitHub.
2. You should see a notification saying your branch has recent pushes. Click "Compare & pull request."
3. Ensure that the base branch is correct (usually `main`) and the compare branch is your feature branch.
4. Fill in the PR title and description.
   - The title should summarize the changes (use a similar format to commit messages).
   - In the description, explain **what** the changes are, **why** they were necessary, and any relevant details (e.g., links to issues or feature requests).
   
   **Example Title:**
   ```
   feat(auth): implement OAuth2 support for third-party login
   ```

   **Example Description:**
   ```
   This PR adds OAuth2 support for third-party authentication, allowing users to log in using Google or Facebook. The `auth.py` module has been refactored for better scalability.
   
   Closes #45
   ```
5. Request reviewers and add any relevant tags or labels (e.g., `feature`, `bugfix`).
6. Click "Create pull request."

### GitLab:

1. Go to your repository on GitLab.
2. Navigate to "Merge Requests" and click "New merge request."
3. Choose the source branch (your feature branch) and target branch (usually `main`).
4. Provide a title and description using the same guidelines as above.
5. Click "Create merge request."

## 7. Review and Discuss

- Once the pull request is created, team members or collaborators will review it.
- Respond to any comments or change requests promptly.
- You may need to make additional commits to address feedback. When doing so:
  - Use clear, incremental commit messages.
  - Push the changes to the same branch, and they will automatically be added to the pull request.

## 8. Merge the Pull Request

Once the PR is approved and all comments are resolved, the next step is merging the changes.

### GitHub:

1. After the review, if the PR is approved, click the "Merge pull request" button.
2. Select the appropriate merge strategy:
   - **Squash and Merge**: Combines all commits into one (preferred for smaller changes).
   - **Merge**: Keeps all commits as separate entries.
3. Delete the branch after merging to keep your repo clean.

### GitLab:

1. After approval, click the "Merge" button on the merge request page.
2. Optionally, delete the branch after merging.

## 9. Clean Up Local Branch

After merging the pull request, you can delete your local branch.

### Command:

```bash
git branch -d feature/my-new-feature
```

This deletes your branch locally once it’s no longer needed.

## Additional Tips:

- **Branch Naming Convention**: Keep branch names descriptive to indicate the purpose of the changes.
- **Pull Request Size**: Try to keep PRs small and focused on a single purpose to make them easier to review.
- **Documentation**: If necessary, update the documentation as part of your PR to reflect any changes made to functionality.
