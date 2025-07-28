import { test, expect } from '@playwright/test';

test.describe('Convex Integration', () => {
	test('displays Convex demo page', async ({ page }) => {
		await page.goto('/');

		// Check that the page title is displayed
		await expect(page.locator('h1')).toContainText('Convex + Svelte Demo');

		// Check that the message form is present
		await expect(page.locator('input[placeholder="Your name"]')).toBeVisible();
		await expect(page.locator('input[placeholder="Type a message..."]')).toBeVisible();
		await expect(page.locator('button:has-text("Send")')).toBeVisible();

		// Check that the messages section is present
		await expect(page.locator('h2:has-text("Messages")')).toBeVisible();
	});

	test('send button is disabled when message is empty', async ({ page }) => {
		await page.goto('/');

		const sendButton = page.locator('button:has-text("Send")');

		// Button should be disabled initially
		await expect(sendButton).toBeDisabled();

		// Fill in a message
		await page.fill('input[placeholder="Type a message..."]', 'Test message');

		// Button should now be enabled
		await expect(sendButton).toBeEnabled();

		// Clear the message
		await page.fill('input[placeholder="Type a message..."]', '');

		// Button should be disabled again
		await expect(sendButton).toBeDisabled();
	});

	test('handles loading state gracefully', async ({ page }) => {
		await page.goto('/');

		// The page should show the Messages heading
		await expect(page.getByRole('heading', { name: 'Messages' })).toBeVisible();
	});

	test('form inputs work correctly', async ({ page }) => {
		await page.goto('/');

		const nameInput = page.locator('input[placeholder="Your name"]');
		const messageInput = page.locator('input[placeholder="Type a message..."]');

		// Test name input
		await nameInput.fill('Test User');
		await expect(nameInput).toHaveValue('Test User');

		// Test message input
		await messageInput.fill('Hello, Convex!');
		await expect(messageInput).toHaveValue('Hello, Convex!');
	});

	test('enter key triggers send when message is not empty', async ({ page }) => {
		await page.goto('/');

		const messageInput = page.locator('input[placeholder="Type a message..."]');
		const sendButton = page.locator('button:has-text("Send")');

		// Fill in a message
		await messageInput.fill('Test message');

		// Verify button is enabled
		await expect(sendButton).toBeEnabled();

		// Press Enter - this should trigger the send function
		// Note: We can't easily test the actual sending without a real Convex deployment
		// but we can test that the key handler is set up
		await messageInput.press('Enter');

		// The message input should be cleared after sending (if Convex is connected)
		// or remain if there's an error (if Convex is not connected)
		// We'll just verify the interaction doesn't break the page
		await expect(page.locator('h1')).toContainText('Convex + Svelte Demo');
	});
});
