# Unit Testing Setup Guide

## Frontend Testing Setup (Angular)

### Prerequisites
- Node.js and npm installed
- Angular CLI installed globally (`npm install -g @angular/cli`)
- Visual Portfolio frontend project checked out

### Step 1: Install Testing Dependencies
Navigate to the frontend directory and install the required testing packages:

```bash
cd frontend
npm install --save-dev @types/jasmine jasmine-core karma karma-chrome-launcher karma-coverage karma-jasmine karma-jasmine-html-reporter
```

### Step 2: Verify Testing Configuration
The `angular.json` file should already have testing configuration. Make sure these sections exist:

```json
{
  "test": {
    "builder": "@angular-devkit/build-angular:karma",
    "options": {
      "main": "src/test.ts",
      "polyfills": "src/polyfills.ts",
      "tsConfig": "tsconfig.spec.json",
      "karmaConfig": "karma.conf.js",
      "assets": ["src/favicon.ico", "src/assets"],
      "styles": ["src/global.css"],
      "scripts": []
    }
  }
}
```

### Step 3: Creating Your First Component Test
Example test file for a component (`about.component.spec.ts`):

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AboutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Add more test cases here
});
```

#### Example 1: Component Creation
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutComponent } from './about.component';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AboutComponent ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

#### Example 2: Testing an Input Property
Suppose your component has an `@Input() title: string;` property:
```typescript
it('should display the input title', () => {
  component.title = 'Test Title';
  fixture.detectChanges();
  const compiled = fixture.nativeElement as HTMLElement;
  expect(compiled.querySelector('h1')?.textContent).toContain('Test Title');
});
```

#### Example 3: Testing a Button Click
Suppose your component has a button that calls `onClick()`:
```typescript
it('should call onClick when button is clicked', () => {
  spyOn(component, 'onClick');
  const button = fixture.nativeElement.querySelector('button');
  button.click();
  expect(component.onClick).toHaveBeenCalled();
});
```

### Step 4: Running Frontend Tests
```bash
ng test               # Run tests with watch mode
ng test --no-watch   # Run tests once
ng test --code-coverage  # Generate coverage report
```

## Backend Testing Setup (Node.js)

### Step 1: Install Testing Dependencies
Navigate to the backend directory and install Jest:

```bash
cd backend
npm install --save-dev jest supertest @types/jest
```

### Step 2: Update package.json
Add the test script to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "jest": {
    "testEnvironment": "node",
    "coveragePathIgnorePatterns": [
      "/node_modules/"
    ]
  }
}
```

### Step 3: Creating Your First API Test
Example test file for user routes (`userRoutes.test.js`):

```javascript
const request = require('supertest');
const app = require('../server');
const User = require('../models/User');

describe('User Routes', () => {
  beforeEach(async () => {
    // Clear test database or setup test data
  });

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('username', 'testuser');
  });

  // Add more test cases here
});
```

#### Example 1: Create User API
```javascript
const request = require('supertest');
const app = require('../server');

describe('User Routes', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('username', 'testuser');
  });
});
```

#### Example 2: Login API (Success and Failure)
```javascript
it('should login with correct credentials', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'password123' });
  expect(res.statusCode).toBe(200);
  expect(res.body).toHaveProperty('token');
});

it('should fail login with wrong password', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'test@example.com', password: 'wrongpass' });
  expect(res.statusCode).toBe(401);
});
```

#### Example 3: Get Items API
```javascript
it('should get all items', async () => {
  const res = await request(app).get('/api/items');
  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
});
```

### Step 4: Running Backend Tests
```bash
npm test           # Run tests once
npm run test:watch # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

## Best Practices

### Writing Tests
1. Follow the AAA pattern:
   - Arrange (setup test data)
   - Act (perform the action)
   - Assert (verify the results)

2. Test file naming:
   - Frontend: `*.component.spec.ts`, `*.service.spec.ts`
   - Backend: `*.test.js`

3. Group related tests using `describe` blocks
4. Use clear test descriptions with "should" statements
5. Test both success and error cases

### Code Coverage
- Aim for at least 80% code coverage
- Focus on critical business logic
- Run coverage reports regularly

### Common Test Cases

#### Frontend
- Component creation
- Input/Output properties
- User interactions
- Service method calls
- Error handling
- Form validation

#### Backend
- API endpoints
- Database operations
- Authentication/Authorization
- Input validation
- Error handling
- Edge cases

## Debugging and Troubleshooting Guide

### Frontend (Angular) Debugging

#### Common Error Messages and Solutions

1. **"No provider for X" Error**
```typescript
// Fix: Add provider to TestBed configuration
beforeEach(async () => {
  await TestBed.configureTestingModule({
    declarations: [ YourComponent ],
    providers: [ YourService ]  // Add missing provider
  }).compileComponents();
});
```

2. **"Cannot read property 'X' of undefined"**
```typescript
// Fix: Initialize properties in beforeEach
beforeEach(() => {
  component.someProperty = initialValue;
  fixture.detectChanges();
});
```

3. **"Expected X to be Y" Failing**
```typescript
// Debug tip: Log values before assertion
it('should have correct value', () => {
  console.log('Actual:', component.value);
  console.log('Expected:', expectedValue);
  expect(component.value).toBe(expectedValue);
});
```

#### Using Angular Debug Tools
```typescript
// Import DebugElement
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

// Query elements
const debugEl: DebugElement = fixture.debugElement;
const element = debugEl.query(By.css('.your-class'));
console.log('Element:', element.nativeElement);
```

#### Testing Async Operations
```typescript
// Using fakeAsync
import { fakeAsync, tick } from '@angular/core/testing';

it('should handle async operations', fakeAsync(() => {
  component.doAsyncThing();
  tick(1000); // Simulate time passage
  expect(component.asyncResult).toBeTruthy();
}));
```

### Backend (Jest) Debugging

#### Common Jest Issues and Solutions

1. **Timeout Errors**
```javascript
// In jest.config.js or package.json
{
  "jest": {
    "testTimeout": 10000  // Increase timeout to 10 seconds
  }
}

// Or in individual test
jest.setTimeout(10000);
```

2. **Database Connection Issues**
```javascript
// Setup test database connection
beforeAll(async () => {
  try {
    await mongoose.connect(process.env.TEST_DB_URI);
  } catch (err) {
    console.error('Database connection failed:', err);
  }
});

// Cleanup after tests
afterAll(async () => {
  await mongoose.connection.close();
});
```

3. **Mocking Dependencies**
```javascript
// Mock external service
jest.mock('../services/externalService');
const mockExternalService = require('../services/externalService');

// Verify mock calls
expect(mockExternalService.someMethod).toHaveBeenCalledWith(expectedArgs);
```

#### Using Jest Debug Tools

1. **Verbose Output**
```bash
npm test -- --verbose
```

2. **Test Single File**
```bash
npm test -- userRoutes.test.js
```

3. **Watch Specific Tests**
```bash
npm test -- --watch -t "test name pattern"
```

### Debugging Steps for Both Frontend and Backend

1. **Initial Investigation**
   - Read the full error message
   - Check the line number and file
   - Review recent code changes

2. **Console Logging**
```javascript
// Strategic console.logs
console.log('Data at point A:', valueA);
console.log('Data at point B:', valueB);
```

3. **Using Debugger**
```javascript
// Add debugger statement
debugger;
// Run tests with node --inspect
```

4. **Environment Issues**
   - Check Node.js version
   - Verify all dependencies installed
   - Clear node_modules and reinstall
   ```bash
   rm -rf node_modules
   npm clean-install
   ```

### Quick Fixes for Common Issues

1. **Tests Not Running**
```bash
# Frontend
ng test --karma-config=karma.conf.js
# Backend
NODE_ENV=test npm test
```

2. **Missing Dependencies**
```bash
# Frontend
npm install --save-dev @types/jasmine jasmine-core
# Backend
npm install --save-dev jest @types/jest
```

3. **Test Configuration**
```javascript
// karma.conf.js debugging
browsers: ['Chrome'],
singleRun: false,
logLevel: config.LOG_DEBUG

// jest.config.js debugging
verbose: true,
testEnvironment: 'node',
```

### Getting Help
- Use the `--verbose` flag for more detailed output
- Check test coverage: `npm run test:coverage`
- Review test documentation:
  - [Angular Testing Guide](https://angular.io/guide/testing)
  - [Jest Documentation](https://jestjs.io/docs/getting-started)
- Use VS Code debugging tools with the Jest and Karma test runners