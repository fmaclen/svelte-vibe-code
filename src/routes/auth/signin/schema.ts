import * as v from 'valibot';

export const signinSchema = v.object({
	email: v.pipe(
		v.string(),
		v.nonEmpty('Please enter your email.'),
		v.email('The email address is badly formatted.')
	),
	password: v.pipe(v.string(), v.nonEmpty('Please enter your password.'))
});

export type SigninData = v.InferOutput<typeof signinSchema>;