import { test, expect } from '@playwright/test';

test('homepage displays Convex demo', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Convex + Svelte Demo' })).toBeVisible();
});
