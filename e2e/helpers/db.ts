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
		// Use the PocketBase CLI to create superuser
		const { spawn } = await import('child_process');

		return new Promise<void>((resolve, reject) => {
			const childProcess = spawn(
				'./pocketbase/pocketbase',
				['superuser', 'create', ADMIN_EMAIL, ADMIN_PASSWORD],
				{
					cwd: process.cwd(),
					stdio: 'pipe'
				}
			);

			let output = '';
			let errorOutput = '';

			childProcess.stdout.on('data', (data) => {
				output += data.toString();
			});

			childProcess.stderr.on('data', (data) => {
				errorOutput += data.toString();
			});

			childProcess.on('close', (code) => {
				if (code === 0) {
					console.log('Admin user created successfully');
					resolve();
				} else if (errorOutput.includes('already exists') || errorOutput.includes('duplicate')) {
					console.log('Admin user already exists');
					resolve();
				} else {
					console.error('Failed to create admin:', errorOutput);
					reject(new Error(`Failed to create admin: ${errorOutput}`));
				}
			});

			childProcess.on('error', (error) => {
				reject(error);
			});
		});
	} catch (error) {
		console.error('Failed to seed admin:', error);
		throw error;
	}
}
