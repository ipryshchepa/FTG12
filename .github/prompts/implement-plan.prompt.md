# Plan Implementation Prompt

## Usage
Implement the plan. Summarize the results to Plans folder.

## What It Does
1. Reads the currently selected plan file
2. Implements all tasks in the plan
3. Creates comprehensive tests
4. Runs tests to verify
5. Creates result file: `[plan-number]-[plan-name].result.md`

## Result Format
Results follow this structure:
- **Header**: Plan name, date, status
- **Summary**: Brief overview
- **Features**: What was implemented
- **Tests**: Coverage and results
- **Files**: Created/modified list
- **Verification**: Checklist of completed items

See existing `*.result.md` files in Plans/ for format examples.

## Requirements
- ✅ All tests must pass
- ✅ 80%+ code coverage for new code
- ✅ Follow `.github/instructions/` coding standards
- ✅ No compilation/linting errors
