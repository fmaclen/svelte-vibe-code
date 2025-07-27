import PocketBase from 'pocketbase';

const pb = new PocketBase('http://127.0.0.1:8090');

// Test admin credentials
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'qweasdzxc';

export async function resetDatabase() {
	try {
		// Ensure admin exists first
		await seedAdmin();
		
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
		// Ensure admin exists first
		await seedAdmin();
		
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

export async function seedAdmin() {
	try {
		// Try to create the initial superuser using the install endpoint
		const response = await fetch('http://127.0.0.1:8090/api/install', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				email: ADMIN_EMAIL,
				password: ADMIN_PASSWORD,
				passwordConfirm: ADMIN_PASSWORD
			})
		});

		if (response.ok) {
			console.log('Admin user created successfully');
		} else if (response.status === 400) {
			// Admin might already exist, that's fine
			console.log('Admin user already exists');
		} else {
			throw new Error(`Failed to create admin: ${response.status}`);
		}
	} catch (error) {
		console.error('Failed to seed admin:', error);
		throw error;
	}
}