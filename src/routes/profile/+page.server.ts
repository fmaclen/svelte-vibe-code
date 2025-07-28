import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('session');
	if (!session) {
		redirect(303, '/auth/signin');
	}

	return {
		user: { email: 'user@example.com', name: 'Test User' }
	};
};