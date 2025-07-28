import { fail } from '@sveltejs/kit';
import { superValidate } from 'sveltekit-superforms';
import { valibot } from 'sveltekit-superforms/adapters';
import { resetPasswordSchema } from './schema.js';
import type { Actions, PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	return {
		form: await superValidate(valibot(resetPasswordSchema))
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await superValidate(request, valibot(resetPasswordSchema));

		if (!form.valid) {
			return fail(400, {
				form
			});
		}

		const { email } = form.data;

		// TODO: Replace with actual password reset implementation
		console.log('Password reset requested for:', email);

		return {
			form,
			success: true,
			message: 'If an account with that email exists, a password reset email has been sent.'
		};
	}
};