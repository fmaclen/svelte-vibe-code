import * as v from 'valibot';

export const signupSchema = v.pipe(
	v.object({
		email: v.pipe(
			v.string(),
			v.nonEmpty('Please enter your email.'),
			v.email('The email address is badly formatted.')
		),
		password: v.pipe(
			v.string(),
			v.nonEmpty('Please enter your password.'),
			v.minLength(8, 'Your password must have 8 characters or more.')
		),
		confirmPassword: v.string()
	}),
	v.forward(
		v.partialCheck(
			[['password'], ['confirmPassword']],
			(input) => input.password === input.confirmPassword,
			'The two passwords do not match.'
		),
		['confirmPassword']
	)
);

export type SignupData = v.InferOutput<typeof signupSchema>;
