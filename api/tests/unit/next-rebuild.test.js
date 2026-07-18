const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..', '..', '..');
const webRoot = path.join(projectRoot, 'web');

function read(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

describe('Next.js rebuild shell', () => {
  it('defines a TypeScript Next.js frontend package with heavy verification tooling', () => {
    const packageJson = JSON.parse(read('web/package.json'));

    expect(packageJson.dependencies).toHaveProperty('next');
    expect(packageJson.dependencies).toHaveProperty('react');
    expect(packageJson.dependencies).toHaveProperty('zod');
    expect(packageJson.devDependencies).toHaveProperty('@playwright/test');
    expect(packageJson.devDependencies).toHaveProperty('@storybook/nextjs');
    expect(packageJson.scripts).toHaveProperty('build');
    expect(packageJson.scripts).toHaveProperty('test:e2e');
    expect(packageJson.scripts).toHaveProperty('storybook');
  });

  it('maps the existing static page set to App Router routes', () => {
    const expectedRoutes = [
      'dashboard',
      'search',
      'feed',
      'papers/[paperId]',
      'profile',
      'analytics',
      'collections',
      'notifications',
      'requests',
      'login',
      'signup',
      'submit',
      'citations'
    ];

    for (const route of expectedRoutes) {
      expect(fs.existsSync(path.join(webRoot, 'app', route, 'page.tsx'))).toBe(true);
    }
  });

  it('centralizes design tokens and reusable components', () => {
    const tailwindConfig = read('web/tailwind.config.ts');
    const button = read('web/components/ui/button.tsx');
    const paperCard = read('web/components/papers/paper-card.tsx');
    const appShell = read('web/components/layout/app-shell.tsx');

    expect(tailwindConfig).toContain('primarySoft');
    expect(tailwindConfig).toContain('darkCanvas');
    expect(button).toContain('variant');
    expect(paperCard).toContain('Save');
    expect(appShell).toContain('Settings');
  });

  it('uses typed API client functions for dynamic user flows', () => {
    const client = read('web/lib/api.ts');

    for (const endpoint of [
      '/api/v1/papers/search',
      '/api/v1/saved-papers',
      '/api/v1/collections',
      '/api/v1/notifications',
      '/api/v1/research-requests',
      '/api/v1/settings',
      '/api/v1/citations/export'
    ]) {
      expect(client).toContain(endpoint);
    }

    expect(client).toContain('z.object');
    expect(client).toContain('authFetch');
  });

  it('wires visible primary actions to typed API client functions', () => {
    const routeView = read('web/components/routes/route-view.tsx');
    const paperCard = read('web/components/papers/paper-card.tsx');

    for (const functionName of [
      'login',
      'register',
      'submitResearch',
      'createResearchRequest',
      'createCollection',
      'markNotificationRead',
      'exportCitation'
    ]) {
      expect(routeView).toContain(functionName);
    }

    expect(paperCard).toContain('savePaper');
  });

  it('contains Playwright, accessibility, Storybook, and API mocking setup', () => {
    expect(fs.existsSync(path.join(webRoot, 'playwright.config.ts'))).toBe(true);
    expect(fs.existsSync(path.join(webRoot, 'tests', 'researchhub.spec.ts'))).toBe(true);
    expect(fs.existsSync(path.join(webRoot, '.storybook', 'main.ts'))).toBe(true);
    expect(fs.existsSync(path.join(webRoot, 'mocks', 'handlers.ts'))).toBe(true);
    expect(read('web/tests/researchhub.spec.ts')).toContain('AxeBuilder');
  });
});
