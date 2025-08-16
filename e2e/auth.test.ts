import { test, expect } from '@playwright/test';
import { ConvexClient } from 'convex/browser';
import { api } from '../convex/_generated/api';

async function clearAllData() {
	const convexUrl = process.env.PUBLIC_CONVEX_URL;
	if (!convexUrl) throw new Error('PUBLIC_CONVEX_URL is not set');

	const client = new ConvexClient(convexUrl);
	try {
		await client.mutation(api.dev.clearAllData, {});
	} catch (error) {
		console.error('Failed to clear database:', error);
		throw error;
	} finally {
		await client.close();
	}
}

test.describe('Authentication', () => {
	test.beforeEach(async () => {
		await clearAllData();
	});

	test('redirects to login when not authenticated', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Sign in to manage your account'
		);
	});

	test('displays login form elements', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login');
		await expect(page.getByPlaceholder('Email')).toBeVisible();
		await expect(page.getByPlaceholder('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();
		await expect(page.getByText('Sign up instead')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in anonymously' })).toBeVisible();
	});

	test('can toggle between sign in and sign up modes', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Sign in to manage your account'
		);
		await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
		await page.getByText('Sign up instead').click();
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Create a new account');
		await expect(page.getByRole('button', { name: 'Sign up', exact: true })).toBeVisible();
		await page.getByText('Sign in instead').click();
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Sign in to manage your account'
		);
		await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
	});

	test('can sign in anonymously and sign out', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login');
		await page.getByRole('button', { name: 'Sign in anonymously' }).click();
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Convex + Svelte Demo');
		const userDisplay = page.locator('.text-gray-600').filter({ hasText: 'Anonymous User' });
		await expect(userDisplay).toBeVisible();
		const signOutButton = page.getByRole('button', { name: 'Sign Out' });
		await expect(signOutButton).toBeVisible();
		await expect(page.getByPlaceholder('Type a message...')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
		await signOutButton.click();
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Sign in to manage your account'
		);
	});

	test('persists authentication across page refreshes', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login');
		await page.getByRole('button', { name: 'Sign in anonymously' }).click();
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Convex + Svelte Demo');
		await page.reload();
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Convex + Svelte Demo');
		const userDisplay = page.locator('.text-gray-600').filter({ hasText: 'Anonymous User' });
		await expect(userDisplay).toBeVisible();
	});
});

test.describe('Chat Functionality', () => {
	test.beforeEach(async ({ page }) => {
		await clearAllData();
		await page.goto('/');
		await page.getByRole('button', { name: 'Sign in anonymously' }).click();
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Convex + Svelte Demo');
	});

	test('can send a message', async ({ page }) => {
		const messageInput = page.getByPlaceholder('Type a message...');
		const sendButton = page.getByRole('button', { name: 'Send' });
		await expect(sendButton).toBeDisabled();
		const testMessage = `Test message ${Date.now()}`;
		await messageInput.fill(testMessage);
		await expect(sendButton).toBeEnabled();
		await sendButton.click();
		await expect(messageInput).toHaveValue('');
		await expect(page.getByText(testMessage)).toBeVisible();
	});

	test('can send message with Enter key', async ({ page }) => {
		const messageInput = page.getByPlaceholder('Type a message...');
		const testMessage = `Enter key test ${Date.now()}`;
		await messageInput.fill(testMessage);
		await messageInput.press('Enter');
		await expect(messageInput).toHaveValue('');
		await expect(page.getByText(testMessage)).toBeVisible();
	});

	test('shows message author and timestamp', async ({ page }) => {
		const messageInput = page.getByPlaceholder('Type a message...');
		const testMessage = `Timestamp test ${Date.now()}`;
		await messageInput.fill(testMessage);
		await messageInput.press('Enter');
		await expect(page.getByText(testMessage)).toBeVisible();
		const messageContainer = page.locator('.rounded.border').filter({ hasText: testMessage });
		await expect(
			messageContainer.locator('strong').filter({ hasText: 'Anonymous User:' })
		).toBeVisible();
		const dateToday = new Date().toLocaleDateString();
		await expect(messageContainer.getByText(dateToday, { exact: false })).toBeVisible();
	});

	test('displays multiple messages in order', async ({ page }) => {
		const messageInput = page.getByPlaceholder('Type a message...');
		const messages = [
			`First message ${Date.now()}`,
			`Second message ${Date.now() + 1}`,
			`Third message ${Date.now() + 2}`
		];
		for (const message of messages) {
			await messageInput.fill(message);
			await messageInput.press('Enter');
			await expect(page.getByText(message)).toBeVisible();
		}
		for (const message of messages) {
			await expect(page.getByText(message)).toBeVisible();
		}
	});
});
