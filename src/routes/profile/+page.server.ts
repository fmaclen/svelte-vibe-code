import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.pb.authStore.isValid) {
		redirect(303, '/auth/signin');
	}

	return {
		user: locals.pb.authStore.model
	};
};