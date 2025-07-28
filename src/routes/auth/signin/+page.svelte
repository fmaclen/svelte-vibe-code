<script>
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { signinSchema } from './schema.js';

	let { data } = $props();

	const form = superForm(data.form, {
		validators: valibot(signinSchema),
		onUpdated: ({ form: f }) => {
			if (f.valid) {
				toast.success('Signed in successfully!');
			} else {
				toast.error('Please fix the errors in the form.');
			}
		}
	});

	const { form: formData, enhance } = form;
</script>

<div class="container mx-auto max-w-md py-8">
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title class="text-2xl">Sign In</Card.Title>
			<Card.Description>Sign in to your account</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" use:enhance class="space-y-4">
				<Form.Field {form} name="email">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Email</Form.Label>
							<Input {...props} type="email" bind:value={$formData.email} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Field {form} name="password">
					<Form.Control>
						{#snippet children({ props })}
							<Form.Label>Password</Form.Label>
							<Input {...props} type="password" bind:value={$formData.password} />
						{/snippet}
					</Form.Control>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Button class="w-full">Sign In</Form.Button>
			</form>

			<div class="mt-4 text-center text-sm">
				<a href="/auth/reset-password" class="text-muted-foreground hover:underline">
					Forgot password?
				</a>
			</div>
		</Card.Content>
	</Card.Root>
</div>