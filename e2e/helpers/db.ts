import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Test admin credentials
const ADMIN_EMAIL = 'admin@test.local';
const ADMIN_PASSWORD = 'adminpassword123';

export async function resetDatabase() {
	try {
		// Authenticate as superuser
		await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);

		// Clear all users except admin
		const users = await pb.collection('users').getFullList();
		for (const user of users) {
			if (user.email !== ADMIN_EMAIL) {
				await pb.collection('users').delete(user.id);
			}
		}

		// Clear profiles collection
		try {
			const profiles = await pb.collection('profiles').getFullList();
			for (const profile of profiles) {
				await pb.collection('profiles').delete(profile.id);
			}
		} catch (e) {
			// Collection might not exist yet
		}
	} catch (error) {
		console.error('Failed to reset database:', error);
		throw error;
	} finally {
		pb.authStore.clear();
	}
}

export async function createTestUser(data: {
	email: string;
	password: string;
	name?: string;
	bio?: string;
}) {
	try {
		// Authenticate as superuser to create users
		await pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);

		const user = await pb.collection('users').create({
			email: data.email,
			password: data.password,
			passwordConfirm: data.password,
			name: data.name || 'Test User',
			emailVisibility: true
		});

		// Create associated profile if bio is provided
		if (data.bio) {
			await pb.collection('profiles').create({
				user: user.id,
				bio: data.bio
			});
		}

		return user;
	} catch (error) {
		console.error('Failed to create test user:', error);
		throw error;
	} finally {
		pb.authStore.clear();
	}
}