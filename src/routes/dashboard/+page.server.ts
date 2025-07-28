import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	// Check if user is authenticated
	if (!locals.pb.authStore.isValid) {
		redirect(303, '/auth/signin');
	}

	return {
		user: locals.pb.authStore.record
	};
};

export const actions: Actions = {
	signout: async ({ locals }) => {
		locals.pb.authStore.clear();
		redirect(303, '/');
	}
};
