# Branch Protection Configuration

This document provides instructions for configuring branch protection rules for the Personal Library application repository.

## Overview

Branch protection rules ensure code quality by requiring specific checks to pass before code can be merged into the main branch. These rules enforce the quality gates defined in the CI/CD pipeline.

## Configuration Steps

### 1. Access Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** tab
3. Navigate to **Branches** in the left sidebar
4. Click **Add branch protection rule**

### 2. Configure Main Branch Protection

#### Rule Name
- **Branch name pattern**: `main`

#### Required Settings

**Require a pull request before merging**
- ✅ Enable this option
- Set **Required number of approvals before merging**: `1`
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require review from Code Owners (if CODEOWNERS file exists)

**Require status checks to pass before merging**
- ✅ Enable this option
- ✅ Require branches to be up to date before merging
- Add the following required status checks:
  - `Backend Tests`
  - `Frontend Tests`
  - `Docker Build`

**Additional Rules (Recommended)**
- ✅ Require conversation resolution before merging
- ✅ Require signed commits (optional, for enhanced security)
- ✅ Require linear history (optional, keeps git history clean)
- ✅ Do not allow bypassing the above settings
- ◻️ Include administrators (optional - if enabled, admins also follow these rules)

### 3. Save Protection Rules

Click **Create** or **Save changes** to apply the branch protection rules.

## Status Checks Explanation

### Backend Tests
- Runs 143 unit and integration tests for the .NET backend
- Verifies code compiles without errors
- Ensures all backend functionality works correctly
- Must pass before code can be merged

### Frontend Tests
- Runs 414 tests for React components and utilities
- Includes linting checks with ESLint
- Verifies code coverage meets 80% minimum threshold
- Tests all UI interactions and business logic
- Must pass before code can be merged

### Docker Build
- Builds Docker images for backend and frontend
- Verifies Dockerfiles are valid
- Ensures application can be containerized
- Runs only after backend and frontend tests pass

## Enforcement

Once configured, the branch protection rules will:

1. **Prevent direct pushes to main** - All changes must go through pull requests
2. **Block merging until all checks pass** - CI pipeline must succeed
3. **Require code review** - At least one approval needed
4. **Keep branches up to date** - Must rebase/merge latest main before merging

## Bypassing Protection (Emergency Use Only)

If you absolutely need to bypass these rules (e.g., emergency hotfix):

1. Make sure you included administrators in the rules
2. Use the **Override** option when merging
3. Document the reason in the pull request
4. Schedule a follow-up to address any skipped checks

**Note**: Bypassing protection rules should be extremely rare and well-documented.

## Testing the Configuration

After setting up branch protection:

1. Create a new branch: `git checkout -b test-branch-protection`
2. Make a small change and push it
3. Open a pull request to main
4. Verify that:
   - You cannot merge immediately
   - CI checks appear and must pass
   - Approval is required
   - All configured rules are enforced

## Troubleshooting

### Status checks not appearing
- Ensure the workflow has run at least once on a branch
- Check that the job names in `.github/workflows/ci.yml` match the required checks
- Verify the GitHub Actions are enabled for the repository

### Can't merge after approval
- Check all required status checks have passed (green checkmarks)
- Ensure branch is up to date with main (rebase if needed)
- Verify no merge conflicts exist

### Administrators can't bypass rules
- This is intended if "Include administrators" is enabled
- Temporarily disable the rule to merge if absolutely necessary
- Re-enable immediately after merging

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Status Checks Documentation](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
