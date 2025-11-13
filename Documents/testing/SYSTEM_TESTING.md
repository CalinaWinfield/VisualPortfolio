# System Testing Guide for Visual Portfolio

## Setup Instructions

### 1. Install End-to-End Testing Dependencies

```bash
# Frontend (Cypress for Angular)
cd frontend
npm install --save-dev cypress @cypress/schematic

# Add Cypress to Angular project
ng add @cypress/schematic

# Backend (Supertest for API testing)
cd ../backend
npm install --save-dev supertest
```

### 2. Configure Test Environment

Create `cypress.config.ts` in frontend directory:
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    supportFile: false,
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    video: false,
    screenshotOnRunFailure: true,
    experimentalStudio: true
  }
});
```
 
## System Test Cases

### 1. User Authentication Flow

```typescript
// cypress/e2e/auth.cy.ts
describe('Authentication System', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should register a new user', () => {
    cy.visit('/register');
    cy.get('[data-cy="username"]').type('testuser');
    cy.get('[data-cy="email"]').type('test@example.com');
    cy.get('[data-cy="password"]').type('Test123!');
    cy.get('[data-cy="register-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should login existing user', () => {
    cy.visit('/login');
    cy.get('[data-cy="email"]').type('test@example.com');
    cy.get('[data-cy="password"]').type('Test123!');
    cy.get('[data-cy="login-button"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should handle invalid login', () => {
    cy.visit('/login');
    cy.get('[data-cy="email"]').type('test@example.com');
    cy.get('[data-cy="password"]').type('wrongpassword');
    cy.get('[data-cy="login-button"]').click();
    cy.get('[data-cy="error-message"]').should('be.visible');
  });
});
```

### 2. Portfolio Management Flow

```typescript
// cypress/e2e/portfolio.cy.ts
describe('Portfolio Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.login('test@example.com', 'Test123!');
  });

  it('should create a new portfolio', () => {
    cy.visit('/dashboard');
    cy.get('[data-cy="create-portfolio"]').click();
    cy.get('[data-cy="portfolio-title"]').type('My Test Portfolio');
    cy.get('[data-cy="portfolio-description"]').type('Test Description');
    cy.get('[data-cy="save-portfolio"]').click();
    cy.get('[data-cy="portfolio-list"]')
      .should('contain', 'My Test Portfolio');
  });

  it('should upload documents to portfolio', () => {
    cy.visit('/portfolio/1');
    cy.get('[data-cy="upload-button"]').click();
    cy.get('[data-cy="file-input"]')
      .attachFile('test-document.pdf');
    cy.get('[data-cy="document-list"]')
      .should('contain', 'test-document.pdf');
  });

  it('should manage document categories', () => {
    cy.visit('/portfolio/1');
    cy.get('[data-cy="add-category"]').click();
    cy.get('[data-cy="category-name"]').type('Projects');
    cy.get('[data-cy="save-category"]').click();
    cy.get('[data-cy="category-list"]')
      .should('contain', 'Projects');
  });
});
```

### 3. Document Management Flow

```typescript
// cypress/e2e/documents.cy.ts
describe('Document Management', () => {
  beforeEach(() => {
    cy.login('test@example.com', 'Test123!');
  });

  it('should upload and organize documents', () => {
    cy.visit('/documents');
    cy.get('[data-cy="upload-doc"]').click();
    cy.get('[data-cy="file-input"]')
      .attachFile('test-resume.pdf');
    cy.get('[data-cy="doc-category"]').select('Resume');
    cy.get('[data-cy="save-doc"]').click();
    cy.get('[data-cy="doc-list"]')
      .should('contain', 'test-resume.pdf');
  });

  it('should share documents', () => {
    cy.visit('/documents/1');
    cy.get('[data-cy="share-button"]').click();
    cy.get('[data-cy="share-email"]').type('colleague@example.com');
    cy.get('[data-cy="send-share"]').click();
    cy.get('[data-cy="share-success"]').should('be.visible');
  });
});
```

## Custom Commands

Add these to `cypress/support/commands.ts`:

```typescript
declare namespace Cypress {
  interface Chainable {
    login(email: string, password: string): void;
  }
}

Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login');
  cy.get('[data-cy="email"]').type(email);
  cy.get('[data-cy="password"]').type(password);
  cy.get('[data-cy="login-button"]').click();
  cy.url().should('include', '/dashboard');
});
```

## Running System Tests

### Frontend Tests (Cypress)
```bash
# Open Cypress Test Runner
npm run cypress:open

# Run tests headlessly
npm run cypress:run

# Run specific test file
npm run cypress:run --spec "cypress/e2e/auth.cy.ts"
```

### Backend Integration Tests
```bash
cd backend
npm run test:integration
```

## Test Data Management

### 1. Setup Test Database
```javascript
// backend/config/test.config.js
module.exports = {
  mongodb: {
    url: process.env.TEST_MONGODB_URI || 'mongodb://localhost:27017/visportfolio_test'
  }
};
```

### 2. Seed Test Data
```javascript
// backend/test/seeds/index.js
async function seedTestData() {
  await User.deleteMany({});
  await Portfolio.deleteMany({});
  
  const testUser = await User.create({
    username: 'testuser',
    email: 'test@example.com',
    password: 'Test123!'
  });

  await Portfolio.create({
    userId: testUser._id,
    title: 'Test Portfolio',
    description: 'Test Description'
  });
}
```

## Best Practices for System Testing

1. **Data Independence**
   - Use unique test data for each test
   - Clean up test data after tests
   - Use meaningful test data names

2. **Test Environment**
   - Keep test environment isolated
   - Use configuration files for different environments
   - Document environment setup requirements

3. **Test Organization**
   - Group related tests together
   - Use descriptive test names
   - Follow user workflows

4. **Performance Considerations**
   - Monitor test execution time
   - Parallelize tests when possible
   - Clean up resources after tests

5. **Maintenance**
   - Use data-cy attributes for selectors
   - Keep tests independent
   - Document complex test scenarios

## Common Issues and Solutions

1. **Flaky Tests**
   - Add proper waiting mechanisms
   - Use retry mechanisms for network requests
   - Handle animation timeouts

2. **Database Issues**
   - Ensure clean state before tests
   - Use transactions for test isolation
   - Handle connection timeouts

3. **Authentication Problems**
   - Manage token expiration
   - Handle session persistence
   - Clear cookies between tests

## Continuous Integration Setup

Add this to your CI pipeline configuration:

```yaml
system-tests:
  stage: test
  script:
    - npm ci
    - npm run build
    - npm run start:test &
    - sleep 10
    - npm run cypress:run
  artifacts:
    when: on_failure
    paths:
      - cypress/screenshots
      - cypress/videos
```

## Reporting

Generate test reports using Cypress's built-in reporters:

```bash
npm run cypress:run --reporter mochawesome
```

This will generate HTML reports in the `cypress/reports` directory.

Need help? Contact the team lead or refer to:
- [Cypress Documentation](https://docs.cypress.io)
- [SuperTest Documentation](https://github.com/visionmedia/supertest#readme)