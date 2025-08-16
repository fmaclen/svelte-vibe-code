import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage to ensure clean state
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());
	});

	test('redirects to login when not authenticated', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Sign in to manage your account'
		);
	});

	test('displays login form elements', async ({ page }) => {
		await page.goto('/login');

		// Check form elements
		await expect(page.getByPlaceholder('Email')).toBeVisible();
		await expect(page.getByPlaceholder('Password')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled();

		// Check toggle link
		await expect(page.getByText('Sign up instead')).toBeVisible();

		// Check anonymous sign in option
		await expect(page.getByRole('button', { name: 'Sign in anonymously' })).toBeVisible();
	});

	test('can toggle between sign in and sign up modes', async ({ page }) => {
		await page.goto('/login');

		// Start in sign in mode
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Sign in to manage your account'
		);
		await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();

		// Switch to sign up mode
		await page.getByText('Sign up instead').click();
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Create a new account');
		await expect(page.getByRole('button', { name: 'Sign up', exact: true })).toBeVisible();

		// Switch back to sign in mode
		await page.getByText('Sign in instead').click();
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Sign in to manage your account'
		);
		await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
	});

	test('can sign in anonymously', async ({ page }) => {
		await page.goto('/login');

		// Click anonymous sign in
		await page.getByRole('button', { name: 'Sign in anonymously' }).click();

		// Wait for redirect and verify we're on the home page
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Convex + Svelte Demo');

		// Verify user is shown as anonymous in the header
		const userDisplay = page.locator('.text-gray-600').filter({ hasText: 'Anonymous User' });
		await expect(userDisplay).toBeVisible();
		await expect(page.getByRole('button', { name: 'Sign Out' })).toBeVisible();

		// Verify message form is visible
		await expect(page.getByPlaceholder('Type a message...')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Send' })).toBeVisible();
	});

	test('can sign out', async ({ page }) => {
		await page.goto('/login');

		// Sign in anonymously first
		await page.getByRole('button', { name: 'Sign in anonymously' }).click();

		// Wait for redirect to home and ensure auth is fully loaded
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Convex + Svelte Demo');
		
		// Ensure the sign out button is visible and ready
		const signOutButton = page.getByRole('button', { name: 'Sign Out' });
		await expect(signOutButton).toBeVisible();

		// Sign out
		await signOutButton.click();

		// Wait for redirect back to login
		await expect(page).toHaveURL('/login');
		await expect(page.getByRole('heading', { level: 1 })).toContainText(
			'Sign in to manage your account'
		);
	});

	test('persists authentication across page refreshes', async ({ page }) => {
		await page.goto('/login');

		// Sign in anonymously
		await page.getByRole('button', { name: 'Sign in anonymously' }).click();

		// Wait for redirect to home
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Convex + Svelte Demo');

		// Refresh the page
		await page.reload();

		// Should still be authenticated and on home page
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Convex + Svelte Demo');
		const userDisplay = page.locator('.text-gray-600').filter({ hasText: 'Anonymous User' });
		await expect(userDisplay).toBeVisible();
	});
});

test.describe('Chat Functionality', () => {
	test.beforeEach(async ({ page }) => {
		// Clear localStorage and sign in anonymously for each test
		await page.goto('/');
		await page.evaluate(() => localStorage.clear());

		await page.goto('/login');
		await page.getByRole('button', { name: 'Sign in anonymously' }).click();

		// Wait for redirect to home
		await expect(page).toHaveURL('/');
		await expect(page.getByRole('heading', { level: 1 })).toContainText('Convex + Svelte Demo');
	});

	test('can send a message', async ({ page }) => {
		const messageInput = page.getByPlaceholder('Type a message...');
		const sendButton = page.getByRole('button', { name: 'Send' });

		// Send button should be disabled with empty message
		await expect(sendButton).toBeDisabled();

		// Type a message
		const testMessage = `Test message ${Date.now()}`;
		await messageInput.fill(testMessage);

		// Send button should be enabled
		await expect(sendButton).toBeEnabled();

		// Send the message
		await sendButton.click();

		// Message input should be cleared
		await expect(messageInput).toHaveValue('');

		// Message should appear in the list
		await expect(page.getByText(testMessage)).toBeVisible();
	});

	test('can send message with Enter key', async ({ page }) => {
		const messageInput = page.getByPlaceholder('Type a message...');

		// Type a message
		const testMessage = `Enter key test ${Date.now()}`;
		await messageInput.fill(testMessage);

		// Press Enter to send
		await messageInput.press('Enter');

		// Message input should be cleared
		await expect(messageInput).toHaveValue('');

		// Message should appear in the list
		await expect(page.getByText(testMessage)).toBeVisible();
	});

	test('shows message author and timestamp', async ({ page }) => {
		const messageInput = page.getByPlaceholder('Type a message...');

		// Send a message
		const testMessage = `Timestamp test ${Date.now()}`;
		await messageInput.fill(testMessage);
		await messageInput.press('Enter');

		// Wait for message to appear
		await expect(page.getByText(testMessage)).toBeVisible();

		// Check that author is shown (Anonymous User: is in the message)
		const messageContainer = page.locator('.rounded.border').filter({ hasText: testMessage });
		await expect(messageContainer.locator('strong').filter({ hasText: 'Anonymous User:' })).toBeVisible();

		// Check that timestamp is shown
		const dateToday = new Date().toLocaleDateString();
		await expect(messageContainer.getByText(dateToday, { exact: false })).toBeVisible();
	});

	test('displays multiple messages in order', async ({ page }) => {
		const messageInput = page.getByPlaceholder('Type a message...');

		// Send multiple messages
		const messages = [
			`First message ${Date.now()}`,
			`Second message ${Date.now() + 1}`,
			`Third message ${Date.now() + 2}`
		];

		for (const message of messages) {
			await messageInput.fill(message);
			await messageInput.press('Enter');
			// Wait for each message to appear before sending next
			await expect(page.getByText(message)).toBeVisible();
		}

		// All messages should be visible
		for (const message of messages) {
			await expect(page.getByText(message)).toBeVisible();
		}
	});
});
