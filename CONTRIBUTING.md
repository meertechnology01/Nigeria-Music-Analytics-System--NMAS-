# Contributing to Nigeria Music Analytics System (NMAS)

Thank you for your interest in contributing to the Nigeria Music Analytics System (NMAS)! This document provides guidelines for contributing to the project.

## 🎯 Project Mission

Our mission is to provide transparent, evidence-based analytics on Nigeria's music industry economic impact, enabling data-driven policy decisions and investment strategies.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Requirements](#testing-requirements)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of background, experience level, or identity.

### Expected Behavior

- Use welcoming and inclusive language
- Respect differing viewpoints and experiences
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, trolling, or discriminatory comments
- Publishing private information without consent
- Unprofessional or inappropriate conduct
- Sustained disruption of discussions

## 🚀 Getting Started

### Prerequisites

- Python 3.11 or higher
- Node.js 18 or higher
- Git
- Basic knowledge of FastAPI (backend) or React (frontend)

### Local Setup

1. **Fork and Clone**
   ```powershell
   git clone https://github.com/YOUR-USERNAME/Afrobeats-Economic-Engine.git
   cd Afrobeats-Economic-Engine
   ```

2. **Install Dependencies**
   ```powershell
   .\scripts\install.ps1
   ```

3. **Start Development Server**
   ```powershell
   .\scripts\start.ps1
   ```

4. **Verify Setup**
   - Backend: http://localhost:8000/docs
   - Frontend: http://localhost:5173

## 🔄 Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring
- `test/description` - Test additions/updates

### Example

```powershell
git checkout -b feature/add-spotify-harvester
# Make your changes
git add .
git commit -m "feat: add Spotify data harvester"
git push origin feature/add-spotify-harvester
```

## 💻 Coding Standards

### Python (Backend)

**Style Guide**: Follow PEP 8

```python
# Good
def calculate_gdp_contribution(streams: int, multiplier: float = 1.8) -> float:
    """
    Calculate GDP contribution from streaming data.
    
    Args:
        streams: Total number of streams
        multiplier: Economic multiplier (default: 1.8)
    
    Returns:
        Estimated GDP contribution in USD
    """
    revenue = streams * 0.004  # Average revenue per stream
    return revenue * multiplier
```

**Key Requirements**:
- Type hints for all function parameters and returns
- Docstrings for all public functions (Google style)
- Maximum line length: 100 characters
- Use `black` for formatting: `black backend/`
- Use `flake8` for linting: `flake8 backend/`

### TypeScript/React (Frontend)

**Style Guide**: Airbnb React/JSX Style Guide

```typescript
// Good
interface EconomicMetrics {
  gdpContribution: number;
  jobsCreated: number;
  exportRevenue: number;
}

export const EconomicImpactCard: React.FC<{ metrics: EconomicMetrics }> = ({ metrics }) => {
  const { currency, formatCurrency } = useSettings();
  
  return (
    <div className="rounded-lg bg-slate-800 p-6">
      <h3 className="text-lg font-semibold text-white">GDP Contribution</h3>
      <p className="text-2xl font-bold text-emerald-400">
        {formatCurrency(metrics.gdpContribution)}
      </p>
    </div>
  );
};
```

**Key Requirements**:
- Functional components with TypeScript
- Props interfaces for all components
- Use Tailwind CSS classes (no inline styles)
- Maximum line length: 100 characters
- Use ESLint: `npm run lint` in frontend/

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Test additions/updates
- `chore`: Maintenance tasks

**Examples**:
```
feat(backend): add Spotify data harvester
fix(frontend): resolve dark mode toggle issue
docs(readme): update installation instructions
test(backend): add unit tests for economic model
```

## 🧪 Testing Requirements

### Backend Testing

```powershell
cd backend
pytest                    # Run all tests
pytest --cov             # Run with coverage
pytest tests/test_model.py  # Run specific test file
```

**Requirements**:
- All new features must include unit tests
- Maintain minimum 80% code coverage
- Test both success and error cases
- Use fixtures for common test data

**Example**:
```python
def test_calculate_gdp_contribution():
    # Arrange
    streams = 1000000
    expected_contribution = 7200.0  # 1M * 0.004 * 1.8
    
    # Act
    result = calculate_gdp_contribution(streams)
    
    # Assert
    assert result == expected_contribution
```

### Frontend Testing

```powershell
cd frontend
npm test                 # Run all tests
npm test -- --coverage  # Run with coverage
```

**Requirements**:
- Test component rendering
- Test user interactions
- Test API integration (mock responses)
- Maintain minimum 70% coverage

## 📤 Pull Request Process

### Before Submitting

1. **Update Documentation**
   - Update README.md if you changed functionality
   - Add JSDoc/docstrings to new functions
   - Update API documentation if endpoints changed

2. **Run Tests**
   ```powershell
   # Backend
   cd backend && pytest --cov
   
   # Frontend
   cd frontend && npm test
   ```

3. **Code Quality Checks**
   ```powershell
   # Backend
   black backend/ && flake8 backend/
   
   # Frontend
   cd frontend && npm run lint
   ```

4. **Self-Review**
   - Remove debug statements and console.logs
   - Check for commented-out code
   - Verify no sensitive data in commits

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] No breaking changes (or documented if necessary)

## Screenshots (if applicable)
```

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one maintainer review required
3. Address review comments
4. Maintainer will merge when approved

## 📝 Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
**Describe the bug**
Clear description of what went wrong

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should have happened

**Environment**
- OS: [e.g., Windows 11]
- Python version: [e.g., 3.11]
- Node version: [e.g., 18.16]
```

### Suggesting Features

Use the feature request template:

```markdown
**Feature Description**
Clear description of the proposed feature

**Problem it Solves**
What problem does this address?

**Proposed Solution**
How should this be implemented?

**Alternatives Considered**
Other approaches you've considered
```

## 🏗️ Architecture Guidelines

### Adding New Data Harvesters

1. Create file in `backend/harvesters/platform_name.py`
2. Implement `fetch_*` function returning `List[TrackDict]`
3. Register in `backend/harvesters/__init__.py`
4. Add defensive fallbacks for scraping failures
5. Add unit tests in `backend/tests/`

**Example**:
```python
# backend/harvesters/new_platform.py
def fetch_new_platform_data(limit: int = 100) -> List[TrackDict]:
    """Fetch data from New Platform."""
    try:
        # Scraping logic
        return tracks
    except Exception as e:
        logger.error(f"New Platform scraping failed: {e}")
        return generate_mock_tracks(limit)
```

### Adding New Dashboard Pages

1. Create component in `frontend/src/pages/NewDashboard.tsx`
2. Register in `DashboardLayout.tsx` tabs array
3. Add route if needed
4. Update navigation menu
5. Follow existing dashboard patterns

## 🔐 Security Guidelines

- **Never commit**:
  - API keys or secrets
  - Database credentials
  - Personal information
  - `.env` files

- **Use environment variables** for sensitive data
- **Sanitize user inputs** on both frontend and backend
- **Report security vulnerabilities** privately to maintainers

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🙏 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Recognized in project documentation

Thank you for contributing to making Nigeria's music economy more visible and data-driven!

---

**Questions?** Open an issue or reach out to maintainers.
