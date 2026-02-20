## Subplan 16: CI/CD Pipeline

**Context:** Implement GitHub Actions CI/CD pipeline with quality gates, automated testing, code coverage enforcement, and Docker image building for the Personal Library application. Pipeline must enforce 80% coverage requirement and ensure all tests pass before allowing merges.

**CI/CD Requirements:**
- Run on pull requests and pushes to main branch
- Build and test backend (ASP.NET Core)
- Build and test frontend (React)
- Enforce 80% code coverage minimum
- Build Docker images
- Report test results and coverage
- Configure branch protection rules

**Current State:**
- ✅ Plans 1-15 completed (Docker, Backend Data Layer, Backend Services, Backend Testing, all Frontend features)
- ✅ Backend: 143 tests passing, 0 failures
- ✅ Frontend: 414 tests passing, 96.22% statement coverage, 87.71% branch coverage
- ✅ Docker configuration complete (docker-compose.yml with db, api, frontend services)
- ✅ ESLint configured for frontend code quality
- ✅ Basic README exists with setup instructions
- ❌ No CI/CD workflows or GitHub Actions configuration exists
- ❌ No .github/workflows directory
- ❌ No branch protection rules configured
- ❌ No code coverage reporting integration (Codecov, etc.)
- ❌ No automated quality gates

**Instruction Files to Review:**
- personallibrary.instructions.md

**Pre-Implementation Notes:**
- Frontend build script already configured with pre-build testing: `"build": "npm test && vite build"` ensures tests must pass before build succeeds
- This provides an additional safety net in the CI/CD pipeline
- Backend has 143 passing tests with comprehensive coverage
- Frontend has 414 passing tests with 96%+ coverage across all metrics

**Tasks:**

1. Create `.github/workflows/` folder at repository root

2. Create `.github/workflows/ci.yml`:
   - Name: "CI Pipeline"
   - Trigger: on push to main, on pull_request to main
   - Jobs: backend-test, frontend-test, docker-build

3. Configure backend-test job in ci.yml:
   - Run on: ubuntu-latest
   - Steps:
     - Checkout code (actions/checkout@v4)
     - Setup .NET 10 SDK (actions/setup-dotnet@v4, dotnet-version: '10.0.x')
     - Restore dependencies: `dotnet restore Backend/PersonalLibrary.API/PersonalLibrary.API.csproj`
     - Build: `dotnet build Backend/PersonalLibrary.API/PersonalLibrary.API.csproj --no-restore`
     - Run tests with coverage: `dotnet test Backend/PersonalLibrary.API.Tests/PersonalLibrary.API.Tests.csproj --no-build --collect:"XPlat Code Coverage" --logger trx --results-directory coverage`
     - Generate coverage report (optional - use ReportGenerator action)
     - Upload coverage to Codecov or similar (actions/codecov-action@v4)
     - Upload test results as artifact
     - Verify job succeeds (currently 143/143 tests passing)

4. Configure frontend-test job in ci.yml:
   - Run on: ubuntu-latest
   - Steps:
     - Checkout code
     - Setup Node.js (actions/setup-node@v4, node-version: '20')
     - Install dependencies: `npm ci` in Frontend directory
     - Run lint: `npm run lint` (ESLint already configured)
     - Run tests with coverage: `npm run test:coverage`
     - Upload coverage to Codecov
     - Upload coverage report as artifact
     - Check coverage meets threshold (job fails if <80%, currently at 96.22% statements, 87.71% branches)

5. Configure docker-build job in ci.yml:
   - Run on: ubuntu-latest
   - Depends on: backend-test, frontend-test (runs only if tests pass)
   - Steps:
     - Checkout code
     - Set up Docker Buildx (docker/setup-buildx-action@v3)
     - Build backend image: `docker build -f Backend/PersonalLibrary.API/Dockerfile -t personal-library-api:test .` (Dockerfile already exists and working)
     - Build frontend image: `docker build -f Frontend/Dockerfile -t personal-library-frontend:test .` (Dockerfile already exists and working)
     - Optionally: push images to container registry (Docker Hub, GitHub Container Registry)
     - Test images can start (health checks)
   - Note: docker-compose.yml already configured with working health checks for all services

6. Add environment variables and secrets configuration:
   - Document required secrets in README
   - For container registry push: DOCKER_USERNAME, DOCKER_PASSWORD (add to repository secrets)
   - For Codecov: CODECOV_TOKEN (add to repository secrets)

7. Create `.github/workflows/codeql.yml` for security scanning:
   - Name: "CodeQL Security Scan"
   - Trigger: on push to main, on pull_request, on schedule (weekly)
   - Use actions/codeql-action for C# and JavaScript analysis
   - Report security vulnerabilities

8. Create status badge configuration:
   - Add CI status badge to README.md
   - Add coverage badge to README.md
   - Format: `![CI](https://github.com/{user}/{repo}/workflows/CI%20Pipeline/badge.svg)`

9. Configure Dependabot (optional but recommended):
   - Create `.github/dependabot.yml`
   - Configure automatic dependency updates for:
     - npm packages (Frontend)
     - NuGet packages (Backend)
     - GitHub Actions
   - Set update frequency (weekly)

10. Create branch protection rules (document instructions, actual config in GitHub settings):
    - Protect main branch
    - Require pull request reviews (minimum 1)
    - Require status checks to pass before merging:
      - backend-test
      - frontend-test
      - docker-build
    - Require branches to be up to date before merging
    - Include administrators in restrictions (optional)

11. Create pull request template:
    - Create `.github/PULL_REQUEST_TEMPLATE.md`
    - Checklist: tests added/updated, tests pass, code reviewed, documentation updated
    - Sections: Description, Changes, Testing, Screenshots (if UI changes)

12. Create issue templates:
    - Create `.github/ISSUE_TEMPLATE/bug_report.md`
    - Create `.github/ISSUE_TEMPLATE/feature_request.md`
    - Include relevant sections and labels

13. Configure code coverage reporting:
    - Create `codecov.yml` at repository root
    - Configure coverage thresholds: patch: 80%, project: 80%
    - Configure status checks: fail if coverage drops

14. Add pre-commit hooks (optional):
    - Install husky: `npm install -D husky` in Frontend
    - Configure pre-commit hook to run tests
    - Configure pre-push hook to run full test suite

15. Create deployment workflow (if deployment target identified):
    - Create `.github/workflows/deploy.yml`
    - Trigger: on push to main (after CI passes)
    - Steps: build images, push to registry, deploy to hosting platform
    - Environment variables for production configuration

**Verification:**
- Before starting: Verify all tests pass locally
  - Backend: `cd Backend/PersonalLibrary.API.Tests; dotnet test` (should show 143 passed)
  - Frontend: `cd Frontend; npm test -- --run` (should show 414 passed)
  - Verify coverage: Frontend `npm run test:coverage` (should show >80%)
- Push code to new branch
- Open pull request to main
- Verify CI workflow triggers automatically
- Check workflow runs in GitHub Actions tab
- Verify backend-test job runs and passes
- Verify frontend-test job runs and passes (including lint check)
- Verify docker-build job runs and passes
- Check test results and coverage reports uploaded as artifacts
- Attempt to merge PR before CI passes - should be blocked (if branch protection enabled)
- Verify status checks displayed in PR
- After CI passes, verify can merge PR
- Check main branch - verify CI runs on push to main
- Intentionally break a test - verify CI fails
- Fix test - verify CI passes again
- Check coverage badges in README display correctly
- Verify Dependabot creates PRs for dependency updates (if configured)
- Verify CodeQL security scan runs (if configured)

**Dependencies:** 
- Plan 4 (Backend Testing) - ✅ Complete
- Plan 15 (Frontend Delete Book - last frontend feature with testing) - ✅ Complete
- All frontend and backend features complete (Plans 1-15)
- Docker configuration operational (Plan 1)
