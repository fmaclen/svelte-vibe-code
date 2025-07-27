import { test, expect } from '@playwright/test';
import { resetDatabase, createTestUser, seedAdmin } from './helpers/db';

test.describe('User Authentication Flow', () => {
	test('user can sign up with valid credentials', async ({ page }) => {
		await resetDatabase();

		await page.goto('/');
		await page.getByRole('link', { name: 'Sign Up' }).click();
		await page.getByLabel('Email').fill('alice@example.com');
		await page.getByLabel('Password').fill('qweasdzxc');
		await page.getByLabel('Confirm Password').fill('qweasdzxc');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(page.getByText('Welcome to your dashboard')).toBeVisible();
	});

	test('user can sign in with existing account', async ({ page }) => {
		await resetDatabase();
		await createTestUser({
			email: 'alice@example.com',
			password: 'qweasdzxc',
			name: 'Alice'
		});

		await page.goto('/');
		await page.getByRole('link', { name: 'Sign In' }).click();
		await page.getByLabel('Email').fill('alice@example.com');
		await page.getByLabel('Password').fill('qweasdzxc');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page.getByText('Welcome back')).toBeVisible();
	});

	test('user can edit their profile', async ({ page }) => {
		await resetDatabase();
		await createTestUser({
			email: 'alice@example.com',
			password: 'qweasdzxc',
			name: 'Alice',
			bio: 'Software developer from Seattle'
		});

		// Sign in with the test user
		await page.goto('/auth/signin');
		await page.getByLabel('Email').fill('alice@example.com');
		await page.getByLabel('Password').fill('qweasdzxc');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await page.waitForURL('/dashboard');

		// Navigate to profile
		await page.getByRole('link', { name: 'Profile' }).click();

		await page.getByLabel('Display Name').clear();
		await page.getByLabel('Display Name').fill('Alice Smith');
		await page.getByLabel('Bio').clear();
		await page.getByLabel('Bio').fill('Full-stack developer specializing in web applications');
		await page.getByRole('button', { name: 'Save Profile' }).click();

		await expect(page.getByText('Profile updated successfully')).toBeVisible();
	});

	test('user can sign out', async ({ page }) => {
		await resetDatabase();
		await createTestUser({
			email: 'alice@example.com',
			password: 'qweasdzxc',
			name: 'Alice'
		});

		// Sign in first
		await page.goto('/auth/signin');
		await page.getByLabel('Email').fill('alice@example.com');
		await page.getByLabel('Password').fill('qweasdzxc');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await page.waitForURL('/dashboard');

		// Sign out
		await page.getByRole('button', { name: 'Account menu' }).click();
		await page.getByRole('menuitem', { name: 'Sign Out' }).click();

		await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
		await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible();
	});

	test('user can request password reset', async ({ page }) => {
		await resetDatabase();
		await createTestUser({
			email: 'alice@example.com',
			password: 'qweasdzxc',
			name: 'Alice'
		});

		await page.goto('/');
		await page.getByRole('link', { name: 'Sign In' }).click();
		await page.getByRole('link', { name: 'Forgot password?' }).click();

		await page.getByLabel('Email').fill('alice@example.com');
		await page.getByRole('button', { name: 'Send Reset Email' }).click();

		await expect(page.getByText('Password reset email sent')).toBeVisible();
		await expect(page.getByText('Check your inbox for instructions')).toBeVisible();
	});
});