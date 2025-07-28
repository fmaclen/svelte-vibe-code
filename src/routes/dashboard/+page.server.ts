import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ cookies }) => {
	// Check if user is authenticated
	const session = cookies.get('session');
	if (!session) {
		redirect(303, '/auth/signin');
	}

	return {
		user: { email: 'user@example.com', name: 'Test User' }
	};
};

export const actions: Actions = {
	signout: async ({ cookies }) => {
		cookies.delete('session', { path: '/' });
		redirect(303, '/');
	}
};
