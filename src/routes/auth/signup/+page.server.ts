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
	default: async ({ request, locals }) => {
		const form = await superValidate(request, valibot(signupSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { email, password } = form.data;

		try {
			// Create the user
			const user = await locals.pb.collection('users').create({
				email,
				password,
				passwordConfirm: password,
				emailVisibility: true
			});

			// Auto-login the user
			await locals.pb.collection('users').authWithPassword(email, password);
		} catch (error) {
			console.error('Signup error:', error);
			return fail(400, {
				form,
				message: 'Failed to create account. Please try again.'
			});
		}

		// Redirect to dashboard (outside try/catch since redirect throws)
		redirect(303, '/dashboard');
	}
};
