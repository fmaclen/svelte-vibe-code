import { test, expect } from '@playwright/test';

test('homepage displays hello world', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Hello World' })).toBeVisible();
});
