import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const apiRequire = createRequire(path.resolve(__dirname, '../../api/package.json'));
apiRequire('dotenv').config({ path: path.resolve(__dirname, '../../api/.env') });
const { pool } = apiRequire('./src/config/database');
const apiBase = process.env.E2E_API_BASE_URL || 'http://localhost:3000/api/v1';
const username = `qae2e${crypto.randomBytes(5).toString('hex')}`;
const email = `${username}@example.com`;
const password = 'ResearchHub-browser-QA!';
let userId: number;
let token: string;
const fixturePapers: number[] = [];

test.beforeAll(async ({ request }) => {
  if (!/^RH_QA_[A-Z0-9_]+$/.test(process.env.DB_USER || '') || process.env.SMTP_HOST) throw new Error('Browser QA requires an isolated RH_QA_* schema and outbound email disabled.');
  const response = await request.post(`${apiBase}/users/register`, { data: { username, email, full_name: 'Browser QA Researcher', password } });
  expect(response.status()).toBe(201);
  const data = await response.json();userId = data.data.user_id;token = data.token;
  const profile = await request.post(`${apiBase}/researchers/me`, { headers: { Authorization: `Bearer ${token}` }, data: {} });
  expect(profile.status()).toBe(201);
});
test.afterAll(async () => {
  try {
    const [papers] = await pool.query('SELECT paper_id FROM RESEARCH_PAPERS WHERE owner_user_id = ?', [userId]);
    for (const paper of papers) {
      const [files] = await pool.query('SELECT storage_key FROM PAPER_FILES WHERE paper_id = ?', [paper.paper_id]);
      for (const file of files) fs.rmSync(path.resolve(__dirname, '../../api/storage/uploads', file.storage_key), { force: true });
      await pool.query('DELETE FROM RESEARCH_PAPERS WHERE paper_id = ?', [paper.paper_id]);
    }
    await pool.query('DELETE FROM USERS WHERE user_id = ?', [userId]);
    await pool.query('DELETE FROM EMAIL_IDENTITIES WHERE normalized_email = ?', [email]);
  } finally { await pool.end(); }
});
async function signIn(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Username or email', { exact: true }).fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/feed/);
  await expect(page.getByText(/publications on your desk/)).toBeVisible();
}

test('landing, login, search and reading desk have accessible loaded states', async ({ page }, testInfo) => {
  const errors: string[] = [];page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/', '/login']) {
    await page.goto(route);await page.waitForLoadState('networkidle');
    expect((await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()).violations).toEqual([]);
  }
  await signIn(page);
  for (const route of ['/feed', '/search?q=quantum']) {
    await page.goto(route);await page.waitForLoadState('networkidle');
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    await testInfo.attach(`${route.includes('feed')?'feed':'search'}-axe`, { body: JSON.stringify(results.violations, null, 2), contentType: 'application/json' });
    expect(results.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('paper save persists after reload and a real library JSON file downloads', async ({ page, request }) => {
  await signIn(page);await page.goto('/search?q=quantum');
  await expect(page.getByText(/results loaded/)).toBeVisible();
  const paper = page.locator('.rh-publication').first();
  await paper.getByRole('button', { name: 'Save', exact: true }).click();
  await paper.getByLabel('Save to your reading library').fill('Browser reading list');
  await paper.locator('form').getByRole('button', { name: 'Save', exact: true }).click();
  await expect(paper.getByRole('status')).toContainText('Saved to Browser reading list');
  await page.reload();
  const saved = await request.get(`${apiBase}/saved-papers`, { headers: { Authorization: `Bearer ${token}` } });
  expect((await saved.json()).data.some((item: {collection_name: string}) => item.collection_name === 'Browser reading list')).toBe(true);
  await page.goto('/citations');
  const downloading = page.waitForEvent('download');await page.getByRole('button', { name: /Export JSON/ }).click();
  const download = await downloading;expect(download.suggestedFilename()).toBe('researchhub-library.json');
  const data = JSON.parse(fs.readFileSync((await download.path())!, 'utf8'));expect(data.length).toBeGreaterThan(0);expect(data[0].collection).toBe('Browser reading list');
});

test('publication wizard uploads a real PDF and reader downloads the same bytes', async ({ page, request }) => {
  await signIn(page);await page.goto('/submit');
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  const pdf = Buffer.from('%PDF-1.4\nBrowser fixture\n%%EOF');
  await page.locator('#file-upload').setInputFiles({ name: 'browser-fixture.pdf', mimeType: 'application/pdf', buffer: pdf });
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Title', { exact: true }).fill(`Browser QA publication ${username}`);
  await page.getByLabel('Abstract', { exact: true }).fill('A browser-tested publication with an exact PDF round trip.');
  const created = page.waitForResponse(response => response.url().endsWith('/api/v1/papers') && response.request().method() === 'POST');
  await page.getByRole('button', { name: 'Finish & Publish', exact: true }).click();
  const response = await created;expect(response.status()).toBe(201);const id=(await response.json()).data.paper_id;fixturePapers.push(id);
  await expect(page.getByRole('heading', { name: 'Research Added!' })).toBeVisible();
  await page.goto(`/papers/${id}`);
  await expect(page.getByRole('heading', { name: `Browser QA publication ${username}` })).toBeVisible();
  const downloading = page.waitForEvent('download');await page.getByRole('button', { name: 'Download', exact: true }).click();
  expect(fs.readFileSync((await (await downloading).path())!).equals(pdf)).toBe(true);
  const result = await request.get(`${apiBase}/papers/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  expect((await result.json()).data.files).toHaveLength(1);
});

test('project notebook persists progress and completion through reload', async ({ page }) => {
  await signIn(page);await page.goto('/projects');
  await page.getByRole('button', { name: 'Start a project' }).click();
  const title = `Browser project ${username}`;
  await page.getByLabel('Project title', { exact: true }).fill(title);
  await page.getByLabel('A short description').fill('Documenting reproducible experiments.');
  await page.getByRole('button', { name: /Create project/ }).click();
  await expect(page.getByRole('heading', { name: title })).toBeVisible();
  const project=page.locator('.rh-project-list article').filter({has:page.getByRole('heading',{name:title})});
  await project.getByRole('button',{name:/Open progress notebook/}).click();
  await project.getByLabel('Add a progress note').fill('Baseline reproduced.');
  await project.getByRole('button',{name:/Publish update/}).click();
  await expect(project.getByText('Baseline reproduced.')).toBeVisible();
  await project.getByRole('button',{name:'Mark completed'}).click();
  await page.reload();await page.getByRole('button',{name:'My projects',exact:true}).click();
  await expect(project.getByRole('button',{name:'Mark active'})).toBeVisible();
});
