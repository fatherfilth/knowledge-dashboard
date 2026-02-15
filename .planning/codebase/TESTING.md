# Testing Patterns

**Analysis Date:** 2026-02-15

## Current State

**No test files exist in the codebase.** This is a gap that should be addressed. The project has dependencies configured for testing but no test suites implemented.

## Test Framework Configuration

**Potential Runners (not currently configured):**
- Jest (common for Next.js, not installed)
- Vitest (modern alternative, not installed)
- Playwright (E2E, not installed)

**Assertion Libraries:**
- Not currently in use

**Note:** The codebase has ESLint + Prettier configured but no test framework runner. To add testing, one of the frameworks below should be installed and configured.

## Recommended Testing Setup

Based on the codebase architecture and Next.js usage, the following setup is recommended:

**For Unit/Integration Tests:**
```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest
```

**For E2E Tests:**
```bash
npm install --save-dev playwright @playwright/test
```

**Configuration File Template (`jest.config.ts`):**
```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**', // Skip page components by default
  ],
};

export default config;
```

## Test File Organization

**Recommended Location:**
- Co-located with source files: `src/lib/__tests__/content.test.ts` next to `src/lib/content.ts`
- Or: `src/__tests__/lib/content.test.ts` in centralized tests directory
- Components: `src/components/ui/__tests__/ArticleCard.test.tsx`

**Naming Convention:**
- Unit tests: `*.test.ts` or `*.test.tsx`
- Integration tests: `*.integration.test.ts`
- E2E tests: separate folder `e2e/` or `tests/e2e/`

**File Structure (if implemented):**
```
src/
├── lib/
│   ├── __tests__/
│   │   ├── content.test.ts
│   │   ├── tags.test.ts
│   │   └── github.test.ts
│   ├── content.ts
│   ├── tags.ts
│   └── github.ts
├── components/
│   └── ui/
│       ├── __tests__/
│       │   └── ArticleCard.test.tsx
│       └── ArticleCard.tsx
```

## Testing Strategy by Module

### `src/lib/content.ts` - Requires Mocking

**What to Test:**
- `fetchCategoryArticles(category)` - File fetching and frontmatter validation
- `fetchAllArticles()` - Aggregation of all categories
- `fetchCategories()` - Category count computation

**Mocking Requirements:**
```typescript
// Mock octokit (GitHub API client)
jest.mock('@/lib/github', () => ({
  octokit: {
    rest: {
      repos: {
        getContent: jest.fn(),
      },
    },
  },
  REPO_CONFIG: {
    owner: 'test-owner',
    repo: 'test-repo',
    basePath: 'docs',
    excludePaths: ['docs/_templates', 'docs/_index'],
    categories: ['models', 'tools', 'skills', 'repos', 'agents', 'projects'],
  },
}));

// Mock gray-matter
jest.mock('gray-matter');
```

**Test Example Pattern:**
```typescript
describe('fetchCategoryArticles', () => {
  it('should fetch and validate articles from a category', async () => {
    // Arrange
    const mockContent = {
      data: [
        {
          name: 'article1.md',
          path: 'docs/models/article1.md',
          type: 'file',
        },
      ],
    };
    (octokit.rest.repos.getContent as jest.Mock).mockResolvedValueOnce({
      data: mockContent.data,
    });

    // Mock file content
    (octokit.rest.repos.getContent as jest.Mock).mockResolvedValueOnce({
      data: {
        content: Buffer.from('---\ntitle: Test\nstatus: stable\n---\nContent').toString('base64'),
      },
    });

    // Act
    const result = await fetchCategoryArticles('models');

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Test');
  });

  it('should return empty array for 404 errors', async () => {
    // Arrange
    (octokit.rest.repos.getContent as jest.Mock).mockRejectedValueOnce({
      status: 404,
    });

    // Act
    const result = await fetchCategoryArticles('nonexistent');

    // Assert
    expect(result).toEqual([]);
  });

  it('should skip articles with invalid frontmatter', async () => {
    // Test validation skipping invalid entries
  });
});
```

### `src/lib/tags.ts` - Pure Functions

**What to Test:**
- `tagToSlug(tag)` - String normalization
- `slugToTag(slug)` - Slug reversal
- `getAllTags()` - Aggregation
- `calculateTagOverlap()` - Set intersection logic
- `getRelatedArticles(article, limit)` - Scoring and sorting

**Testing Approach (Pure Functions):**
```typescript
describe('tagToSlug', () => {
  it('should convert tag to URL-safe slug', () => {
    expect(tagToSlug('Machine Learning')).toBe('machine-learning');
    expect(tagToSlug('C++/Python')).toBe('cpython');
    expect(tagToSlug('  Spaces  ')).toBe('spaces');
    expect(tagToSlug('multiple--hyphens')).toBe('multiple-hyphens');
  });

  it('should handle edge cases', () => {
    expect(tagToSlug('---')).toBe('');
    expect(tagToSlug('')).toBe('');
  });
});

describe('calculateTagOverlap', () => {
  it('should calculate set intersection correctly', () => {
    const article1 = {
      tags: ['AI', 'Machine Learning', 'Python'],
    } as any;
    const article2 = {
      tags: ['Machine Learning', 'Data Science'],
    } as any;

    const overlap = calculateTagOverlap(article1, article2);
    expect(overlap).toBe(1); // Only "Machine Learning"
  });
});
```

**Mocking Requirement:**
- Mock `fetchAllArticles()` to return test data
- Use fixture factory for consistent test articles

### `src/lib/github.ts` - Configuration Only

**What to Test:**
- Configuration is exported correctly
- Environment token is handled (auth presence/absence)

**Test Pattern:**
```typescript
describe('GitHub Configuration', () => {
  it('should export REPO_CONFIG with correct structure', () => {
    expect(REPO_CONFIG).toHaveProperty('owner');
    expect(REPO_CONFIG).toHaveProperty('repo');
    expect(REPO_CONFIG.categories).toHaveLength(6);
  });

  it('should warn if GITHUB_TOKEN is missing', () => {
    const warnSpy = jest.spyOn(console, 'warn');
    // Requires re-importing with unset env var
    delete process.env.GITHUB_TOKEN;
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No GITHUB_TOKEN found')
    );
  });
});
```

### React Components - Rendering Tests

**Example: `ArticleCard` (`src/components/ui/ArticleCard.tsx`)**

**What to Test:**
- Component renders with correct props
- Links point to correct paths
- Conditional rendering (tags > 3)
- Category color mapping

**Test Pattern:**
```typescript
describe('ArticleCard', () => {
  const mockArticle: Article = {
    title: 'Test Article',
    category: 'models',
    slug: 'test-article',
    status: 'stable',
    tags: ['AI', 'ML', 'Python', 'Extra'],
    created: new Date('2024-01-01'),
    updated: new Date('2024-02-15'),
    author: 'Test Author',
    content: 'Test content',
    path: 'docs/models/test-article.md',
  };

  it('should render article title as link', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Test Article')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Test Article' })).toHaveAttribute(
      'href',
      '/models/test-article'
    );
  });

  it('should display first 3 tags with +N indicator', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('AI')).toBeInTheDocument();
    expect(screen.getByText('ML')).toBeInTheDocument();
    expect(screen.getByText('Python')).toBeInTheDocument();
    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });

  it('should render status badge', () => {
    render(<ArticleCard article={mockArticle} />);
    expect(screen.getByText('Stable')).toBeInTheDocument();
  });
});
```

### API Routes - Handler Tests

**Example: `src/app/api/verify/route.ts`**

**What to Test:**
- GET handler returns success/failure status
- Data validation checks pass/fail correctly
- Error handling returns 500

**Test Pattern:**
```typescript
describe('GET /api/verify', () => {
  it('should return success with valid data', async () => {
    const response = await GET();
    const data = await response.json();

    expect(data.success).toBeDefined();
    expect(data.stats).toBeDefined();
    expect(data.checks).toBeDefined();
  });

  it('should report missing categories', async () => {
    // Mock fetchCategories to return incomplete list
    jest.mock('@/lib/content', () => ({
      fetchCategories: jest.fn().mockResolvedValue([]),
    }));

    const response = await GET();
    const data = await response.json();

    expect(data.checks.allCategoriesPresent.passed).toBe(false);
  });

  it('should handle errors and return 500', async () => {
    // Mock error condition
    jest.mock('@/lib/content', () => ({
      fetchAllArticles: jest.fn().mockRejectedValue(new Error('API error')),
    }));

    const response = await GET();
    expect(response.status).toBe(500);
  });
});
```

## Fixtures and Factories

**Test Data Factory (if implemented):**

```typescript
// tests/fixtures/article.factory.ts
import type { Article } from '@/types/content';

export function createMockArticle(overrides?: Partial<Article>): Article {
  return {
    title: 'Mock Article',
    category: 'models',
    slug: 'mock-article',
    status: 'stable',
    tags: ['test'],
    created: new Date('2024-01-01'),
    updated: new Date('2024-02-15'),
    author: 'Test Author',
    content: 'Test markdown content',
    path: 'docs/models/mock-article.md',
    ...overrides,
  };
}

// Usage in tests
const article = createMockArticle({ title: 'Custom Title' });
```

**Location:** `tests/fixtures/` or `src/__tests__/fixtures/`

**Sharing Fixtures:**
- Centralized factory for consistent test data
- Override only what needs changing in individual tests
- Avoids copy-paste errors in test data

## Coverage

**Requirements:** Not enforced (no config found)

**Recommended Targets:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**View Coverage (with Jest):**
```bash
npm test -- --coverage
```

**Configuration (`jest.config.ts`):**
```typescript
{
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**/*.tsx', // Page components harder to test
  ],
  coverageThresholds: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 80,
    },
  },
}
```

## Test Types

### Unit Tests

**Scope:** Single function/module in isolation

**Examples:**
- `tagToSlug()` transformations
- `calculateTagOverlap()` Set logic
- Zod schema validation

**Approach:**
- No external API calls (mock them)
- Fast execution (< 5ms each)
- High quantity (100+ for lib code)

### Integration Tests

**Scope:** Multiple modules working together

**Examples:**
- `fetchCategoryArticles()` including Zod validation
- `getRelatedArticles()` which calls `getAllArticles()` and `calculateTagOverlap()`
- API routes with data loading

**Approach:**
- Mock external dependencies (GitHub API) but not internal
- Slower (5-100ms each)
- Fewer than unit tests (10-20 per module)

### E2E Tests

**Scope:** Full user workflows (if added)

**Examples:**
- Search functionality end-to-end
- Category browse and article view
- Tag filtering

**Framework:** Playwright (recommended for Next.js)

**Pattern:**
```typescript
// e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('should search for articles', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('[aria-label="Search articles"]', 'machine learning');
  await page.waitForSelector('article');
  const articles = await page.locator('article').count();
  expect(articles).toBeGreaterThan(0);
});
```

## Async Testing

**Pattern with async/await:**

```typescript
it('should fetch articles asynchronously', async () => {
  const articles = await fetchCategoryArticles('models');
  expect(articles).toBeDefined();
});
```

**Pattern with callbacks (avoid):**
```typescript
// Older Jest pattern - avoid, use async/await above
it('should fetch articles', (done) => {
  fetchCategoryArticles('models').then(articles => {
    expect(articles).toBeDefined();
    done();
  });
});
```

**Mocking async functions:**
```typescript
jest.mock('@/lib/content', () => ({
  fetchAllArticles: jest.fn().mockResolvedValue([mockArticle]),
  fetchCategoryArticles: jest.fn().mockResolvedValue([mockArticle]),
}));
```

## Error Testing

**Pattern for testing error cases:**

```typescript
describe('Error handling', () => {
  it('should return empty array on 404', async () => {
    (octokit.rest.repos.getContent as jest.Mock).mockRejectedValueOnce({
      status: 404,
    });

    const result = await fetchCategoryArticles('nonexistent');
    expect(result).toEqual([]);
  });

  it('should throw on non-404 errors', async () => {
    (octokit.rest.repos.getContent as jest.Mock).mockRejectedValueOnce(
      new Error('Network error')
    );

    await expect(fetchCategoryArticles('models')).rejects.toThrow(
      'Network error'
    );
  });

  it('should skip invalid frontmatter silently', async () => {
    // Mock file with invalid data
    (octokit.rest.repos.getContent as jest.Mock).mockResolvedValueOnce({
      data: [{ name: 'bad.md', type: 'file', path: 'docs/models/bad.md' }],
    });
    (octokit.rest.repos.getContent as jest.Mock).mockResolvedValueOnce({
      data: { content: Buffer.from('---\ninvalid\n---\nContent').toString('base64') },
    });

    const warnSpy = jest.spyOn(console, 'warn');
    const result = await fetchCategoryArticles('models');

    expect(result).toEqual([]);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Validation failed')
    );
  });
});
```

## Mocking Strategy

**What to Mock:**
- External APIs (GitHub Octokit client)
- Network calls (fetch, axios)
- Environment variables
- File system operations
- Random or time-dependent functions

**What NOT to Mock:**
- Internal business logic (tag calculations, validation)
- TypeScript/Zod validation
- React components (render them instead)
- Utility functions that are being tested

**Mock Example:**
```typescript
// Mock the entire module
jest.mock('@/lib/github', () => ({
  octokit: {
    rest: {
      repos: {
        getContent: jest.fn(),
      },
    },
  },
  REPO_CONFIG: { /* ... */ },
}));

// Use in test
(octokit.rest.repos.getContent as jest.Mock)
  .mockResolvedValueOnce({ data: [...] })
  .mockRejectedValueOnce(new Error('Error'));
```

## Run Commands (When Configured)

```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode
npm test -- --coverage      # Coverage report
npm test -- ArticleCard     # Run tests matching pattern
npm run test:e2e            # E2E tests (if configured)
```

---

*Testing analysis: 2026-02-15*

**Note:** No tests are currently implemented in this codebase. This document provides the framework and patterns for adding tests. The recommended first step would be to set up Jest with TypeScript and add unit tests for `src/lib/` utility functions.
