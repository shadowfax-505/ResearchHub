const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..', '..', '..');
const webRoot = path.join(projectRoot, 'web');

describe('frontend shell assets', () => {
  it('contains the canonical Next.js application shell', () => {
    expect(fs.existsSync(path.join(webRoot, 'app', 'layout.tsx'))).toBe(true);
    expect(fs.existsSync(path.join(webRoot, 'app', 'globals.css'))).toBe(true);
    expect(fs.existsSync(path.join(webRoot, 'components', 'layout', 'app-shell.tsx'))).toBe(true);
  });

  it('maps the main user-facing surfaces to App Router pages', () => {
    for (const route of ['dashboard', 'feed', 'search', 'questions', 'jobs', 'settings', 'admin']) {
      expect(fs.existsSync(path.join(webRoot, 'app', route, 'page.tsx'))).toBe(true);
    }
  });

  it('keeps the frontend API boundary typed and session-aware', () => {
    const client = fs.readFileSync(path.join(webRoot, 'lib', 'api.ts'), 'utf8');
    expect(client).toContain('authFetch');
    expect(client).toContain('z.object');
    expect(client).toContain('/api/v1/papers/search');
    expect(client).toContain('/api/v1/users/login');
  });
});
