import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { signupSchema } from './schema.js';
import type { PageServerLoad, Actions } from './$types.js';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(valibot(signupSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const form = await superValidate(request, valibot(signupSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { email, password } = form.data;

		// TODO: Replace with actual database implementation
		console.log('Creating user:', { email });
		
		// Simulate successful signup by setting a session cookie
		cookies.set('session', 'mock-session-token', {
			path: '/',
			httpOnly: true,
			secure: false,
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7 // 7 days
		});

		redirect(303, '/dashboard');
	}
};
