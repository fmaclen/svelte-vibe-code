import { fail, redirect } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { signinSchema } from './schema.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(valibot(signinSchema))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await superValidate(request, valibot(signinSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { email, password } = form.data;

		try {
			await locals.pb.collection('users').authWithPassword(email, password);
		} catch (error) {
			console.error('Signin error:', error);
			return fail(400, {
				form,
				message: 'Invalid email or password. Please try again.'
			});
		}

		redirect(303, '/dashboard');
	}
};