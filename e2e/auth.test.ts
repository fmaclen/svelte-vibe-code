import { test, expect } from '@playwright/test';
import { resetDatabase, createTestUser } from './helpers/db';

test.describe('User Authentication Flow', () => {
	test('user can sign up with valid credentials', async ({ page }) => {
		await resetDatabase();

		await page.goto('/');
		await page.getByRole('link', { name: 'Sign Up' }).click();
		await page.getByLabel('Email').fill('sarah.johnson@gmail.com');
		await page.getByLabel('Password').fill('SecurePass123!');
		await page.getByLabel('Confirm Password').fill('SecurePass123!');
		await page.getByRole('button', { name: 'Sign Up' }).click();

		await expect(page.getByText('Welcome to your dashboard')).toBeVisible();
	});

	test('user can sign in with existing account', async ({ page }) => {
		await resetDatabase();
		await createTestUser({
			email: 'michael.chen@outlook.com',
			password: 'MySecurePass456!',
			name: 'Michael Chen'
		});

		await page.goto('/');
		await page.getByRole('link', { name: 'Sign In' }).click();
		await page.getByLabel('Email').fill('michael.chen@outlook.com');
		await page.getByLabel('Password').fill('MySecurePass456!');
		await page.getByRole('button', { name: 'Sign In' }).click();

		await expect(page.getByText('Welcome back')).toBeVisible();
	});

	test('user can edit their profile', async ({ page }) => {
		await resetDatabase();
		await createTestUser({
			email: 'emma.wilson@protonmail.com',
			password: 'EmmaPass789!',
			name: 'Emma Wilson',
			bio: 'Software developer from Seattle'
		});

		// Sign in with the test user
		await page.goto('/auth/signin');
		await page.getByLabel('Email').fill('emma.wilson@protonmail.com');
		await page.getByLabel('Password').fill('EmmaPass789!');
		await page.getByRole('button', { name: 'Sign In' }).click();
		await page.waitForURL('/dashboard');

		// Navigate to profile
		await page.getByRole('link', { name: 'Profile' }).click();

		await page.getByLabel('Display Name').clear();
		await page.getByLabel('Display Name').fill('Emma M. Wilson');
		await page.getByLabel('Bio').clear();
		await page.getByLabel('Bio').fill('Full-stack developer specializing in web applications');
		await page.getByRole('button', { name: 'Save Profile' }).click();

		await expect(page.getByText('Profile updated successfully')).toBeVisible();
	});

	test('user can sign out', async ({ page }) => {
		await resetDatabase();
		await createTestUser({
			email: 'james.rodriguez@yahoo.com',
			password: 'JamesSecure321!',
			name: 'James Rodriguez'
		});

		// Sign in first
		await page.goto('/auth/signin');
		await page.getByLabel('Email').fill('james.rodriguez@yahoo.com');
		await page.getByLabel('Password').fill('JamesSecure321!');
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
			email: 'alexandra.taylor@gmail.com',
			password: 'AlexPass999!',
			name: 'Alexandra Taylor'
		});

		await page.goto('/');
		await page.getByRole('link', { name: 'Sign In' }).click();
		await page.getByRole('link', { name: 'Forgot password?' }).click();

		await page.getByLabel('Email').fill('alexandra.taylor@gmail.com');
		await page.getByRole('button', { name: 'Send Reset Email' }).click();

		await expect(page.getByText('Password reset email sent')).toBeVisible();
		await expect(page.getByText('Check your inbox for instructions')).toBeVisible();
	});
});