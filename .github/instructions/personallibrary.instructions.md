---
description: 'Personal Library application development guidelines'
applyTo: '**/*'
---

# Personal Library Application Instructions

## Application Overview

Personal Library is a full-stack web application for managing personal book collections with ownership status tracking, reading status management, loan tracking, and book ratings.

**Technology Stack:**
- Frontend: React 19+, Materialize CSS, Vite
- Backend: ASP.NET Core 10 (Minimal APIs), Entity Framework Core  
- Database: Microsoft SQL Server
- Testing: xUnit (backend), Vitest + React Testing Library (frontend)

## Security Requirements

### Data Security

1. **Input Validation**: Validate all inputs on both client and server; sanitize to prevent XSS attacks
2. **SQL Injection**: Use EF Core parameterized queries; never use string concatenation for queries
3. **CORS**: Configure specific allowed origins for frontend application
4. **HTTPS**: Consider HTTPS for production deployments
5. **Secrets Management**: Store connection strings in User Secrets (dev) or secure configuration (prod)

### Data Privacy

1. **Audit Logging**: Log failed requests and important operations for debugging
2. **Data Exposure**: Never expose sensitive system information in error messages

## Testing Requirements

- **Minimum 80% code coverage** for business logic, components, and services
- All API endpoints and user interactions must have tests
- **Pre-build Requirement**: All tests must pass before build succeeds

## CI/CD Pipeline

**Quality Gates:**
- All tests must pass (100% required)
- Code coverage minimum 80%
- No critical security vulnerabilities
- Successful build for both frontend and backend

**Branch Protection:**
- Require pull request reviews
- Require status checks to pass (CI build)
- Require branches to be up to date before merging

### Code Review Checklist

- [ ] Code follows naming conventions and style guides
- [ ] All new code has corresponding unit tests
- [ ] Tests cover happy path and edge cases
- [ ] No hardcoded secrets or sensitive information
- [ ] Error handling is implemented appropriately
- [ ] Validation is performed on both client and server
- [ ] Database queries are optimized (no N+1 queries)
- [ ] Comments explain "why" not "what" for complex logic
- [ ] No console.log or debugging code in production

Remember: Security, testing, and code quality are non-negotiable. Every feature must be secure, tested, and maintainable.
