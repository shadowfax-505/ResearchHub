import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function signInAsAdmin(page: any) {
  await page.goto('/login');
  await page.getByPlaceholder('Username or email').fill('jane_doe');
  await page.getByPlaceholder('Password').fill('password123');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test('dashboard renders without accessibility violations', async ({ page }) => {
  await signInAsAdmin(page);
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Papers', exact: true })).toBeVisible();
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('core route set renders at desktop and mobile sizes', async ({ page }) => {
  test.setTimeout(90000);
  for (const route of ['/search', '/feed', '/questions', '/collections', '/notifications', '/requests', '/submit', '/citations']) {
    await page.goto(route);
    await expect(page.locator('main')).toHaveScreenshot(`${route.replace('/', '') || 'home'}-page.png`, { maxDiffPixelRatio: 0.02 });
  }
});

test('visible frontend actions respond on the Stitch interface', async ({ page }) => {
  test.setTimeout(90000);
  await page.goto('/search');
  await page.getByPlaceholder('Search papers, researchers, or topics...').fill('quantum learning');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText(/results/i).first()).toBeVisible();

  await page.goto('/settings');
  await page.getByRole('button', { name: /^dark$/i }).first().click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.getByRole('button', { name: /^light$/i }).first().click();

  await page.goto('/collections');
  await page.getByPlaceholder('Collection name').fill('Verification Collection');
  await page.getByPlaceholder('Description').fill('Created from Playwright');
  await page.getByRole('button', { name: /create/i }).click();
  await expect(page.getByText(/Collection created|Collection saved/i)).toBeVisible();

  await page.goto('/notifications');
  await page.getByRole('button', { name: 'Mark read' }).first().click();
  await expect(page.getByText(/Notification marked|Notification updated/i)).toBeVisible();

  await page.goto('/requests');
  await page.getByPlaceholder('Request title').fill('Dataset access');
  await page.getByPlaceholder('Recipient name').fill('Research Team');
  await page.getByPlaceholder('Message').fill('Please share the supporting dataset.');
  await page.getByRole('button', { name: /send request/i }).click();
  await expect(page.getByText(/Request sent|Request saved/i)).toBeVisible();

  await page.goto('/submit');
  await page.getByPlaceholder('Paper title').fill('Functional Verification Paper');
  await page.getByPlaceholder('Abstract').fill('A frontend verification paper submitted through the stitched interface.');
  await page.getByRole('button', { name: /submit research/i }).click();
  await expect(page.getByText(/Research submitted|local draft/i)).toBeVisible();

  await page.goto('/citations');
  await page.getByRole('button', { name: /export/i }).click();
  await expect(page.locator('pre')).not.toContainText('Citation output will appear here');

  await page.goto('/papers/1');
  await page.getByRole('button', { name: /view pdf/i }).click();
  await expect(page.getByText('PDF preview opened')).toBeVisible();
});
