# Contributing to StockPilot

First off, thank you for considering contributing to StockPilot! It's people like you that make StockPilot such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Pull Requests](#pull-requests)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Commit Messages](#commit-messages)
- [Testing](#testing)

---

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- **Be Respectful**: Treat everyone with respect and kindness
- **Be Collaborative**: Work together towards common goals
- **Be Patient**: Remember that everyone learns at different paces
- **Be Constructive**: Provide helpful feedback and accept it gracefully

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When creating a bug report, include as many details as possible:

**Bug Report Template:**

```markdown
## Bug Description
A clear and concise description of what the bug is.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots to help explain your problem.

## Environment
- OS: [e.g., Windows 10, macOS 12.0, Ubuntu 20.04]
- Browser: [e.g., Chrome 95, Firefox 93, Safari 15]
- Node Version: [e.g., 18.12.0]
- App Version: [e.g., 1.2.3]

## Additional Context
Add any other context about the problem here.
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please provide:

**Enhancement Request Template:**

```markdown
## Feature Description
A clear and concise description of the feature you'd like to see.

## Problem It Solves
Explain the problem or use case this feature addresses.

## Proposed Solution
Describe how you envision this feature working.

## Alternative Solutions
Describe any alternative solutions or features you've considered.

## Additional Context
Add any other context, mockups, or screenshots about the feature request.

## Are You Willing to Implement?
[ ] Yes, I can implement this
[ ] I need help implementing this
[ ] Just suggesting the idea
```

### Pull Requests

We actively welcome your pull requests:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/zacktam12/StockPilot.git
   cd StockPilot
   ```

2. **Create a Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Your Changes**
   - Write clean, maintainable code
   - Follow the coding guidelines
   - Add tests if applicable
   - Update documentation

4. **Commit Your Changes**
   ```bash
   git commit -m "feat: add amazing feature"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**
   - Fill in the PR template
   - Link any related issues
   - Request review from maintainers

---

## Development Setup

### Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Configure your .env file
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Configure your .env file
npm run dev
```

### Landing Page Setup

```bash
cd stockLandingPage
npm install
npm run dev
```

---

## Coding Guidelines

### General Principles

- **KISS**: Keep It Simple, Stupid
- **DRY**: Don't Repeat Yourself
- **YAGNI**: You Aren't Gonna Need It
- **SOLID**: Follow SOLID principles

### JavaScript/TypeScript Style

#### Naming Conventions

```javascript
// Variables and functions: camelCase
const userName = 'John';
function getUserData() {}

// Classes and components: PascalCase
class UserService {}
function UserProfile() {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_COUNT = 3;

// Private methods: _prefixed
class Example {
  _privateMethod() {}
}
```

#### Code Formatting

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters
- Use trailing commas in multi-line objects/arrays

```javascript
// Good
const user = {
  name: 'John',
  email: 'john@example.com',
  age: 30,
};

// Bad
const user = {
  name: "John",
  email: "john@example.com",
  age: 30
}
```

#### Component Structure

```javascript
// React Component Structure
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// 1. Imports
import { Button } from '@/components/shared/Button';
import './styles.css';

// 2. Component Definition
function UserProfile({ userId, onUpdate }) {
  // 3. State & Hooks
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // 4. Effects
  useEffect(() => {
    fetchUser();
  }, [userId]);
  
  // 5. Event Handlers
  const handleUpdate = () => {
    onUpdate(user);
  };
  
  // 6. Helper Functions
  const fetchUser = async () => {
    // ...
  };
  
  // 7. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 8. PropTypes
UserProfile.propTypes = {
  userId: PropTypes.string.isRequired,
  onUpdate: PropTypes.func,
};

// 9. Default Props
UserProfile.defaultProps = {
  onUpdate: () => {},
};

// 10. Export
export default UserProfile;
```

### Backend Code Style

#### Controller Pattern

```javascript
// controllers/user.controller.js
const userService = require('../services/user.service');

const getUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUsers,
};
```

#### Service Pattern

```javascript
// services/user.service.js
const userRepository = require('../repositories/user.repository');

const getAllUsers = async () => {
  return await userRepository.findAll();
};

module.exports = {
  getAllUsers,
};
```

### File Organization

```
feature/
├── components/          # React components
│   ├── FeatureList.jsx
│   ├── FeatureCard.jsx
│   └── FeatureForm.jsx
├── hooks/              # Custom hooks
│   └── useFeature.js
├── services/           # API services
│   └── featureService.js
├── utils/              # Utility functions
│   └── featureUtils.js
└── styles/             # Styles
    └── feature.css
```

---

## Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes
- `build`: Build system changes

### Examples

```bash
# Simple commit
feat: add user authentication

# Commit with scope
feat(auth): add password reset functionality

# Breaking change
feat!: change API response format

BREAKING CHANGE: The API now returns data in a new format

# Multiple paragraphs
fix: resolve memory leak in dashboard

The dashboard was causing memory leaks due to
unsubscribed event listeners.

Closes #123
```

---

## Testing

### Frontend Testing

```bash
cd frontend
npm test
```

### Backend Testing

```bash
cd backend
npm test
```

### Writing Tests

#### React Component Test

```javascript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', async () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    await userEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Backend API Test

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('User API', () => {
  it('GET /api/users should return users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
```

---

## Pull Request Process

1. **Update Documentation**: Ensure README and other docs are updated
2. **Add Tests**: Include tests for new features
3. **Update Changelog**: Add your changes to CHANGELOG.md
4. **Pass All Tests**: Ensure all tests pass
5. **Code Review**: Address review comments
6. **Squash Commits**: Keep git history clean (if requested)

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix (non-breaking change)
- [ ] New feature (non-breaking change)
- [ ] Breaking change (fix or feature that would cause existing functionality to change)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests you ran

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have performed a self-review
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests
- [ ] New and existing tests pass locally
- [ ] Any dependent changes have been merged

## Screenshots (if applicable)
Add screenshots here

## Related Issues
Fixes #(issue number)
```

---

## Code Review Guidelines

### For Reviewers

- Be respectful and constructive
- Provide specific feedback
- Suggest improvements, don't demand
- Approve when ready, request changes when needed

### For Contributors

- Respond to feedback promptly
- Ask for clarification when needed
- Make requested changes
- Thank reviewers for their time

---

## Questions?

If you have questions, feel free to:

- Open an issue with the `question` label
- Start a discussion in GitHub Discussions
- Contact: stockpilotsales@gmail.com

---

## Recognition

Contributors will be recognized in:

- README.md Contributors section
- Release notes
- Project website (coming soon)

---

Thank you for contributing to StockPilot! 🎉

## 👨‍💻 Project Maintainer

**Zekarias Tamiru**

- GitHub: [@zacktam12](https://github.com/zacktam12)
- LinkedIn: [Zekarias Tamiru](https://www.linkedin.com/in/zekariastamiru)
- Email: stockpilotsales@gmail.com

---

<div align="center">

**Happy Coding!** 💻

</div>


