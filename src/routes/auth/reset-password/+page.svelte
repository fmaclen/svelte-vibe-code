<script>
	import { superForm } from 'sveltekit-superforms';
	import { valibot } from 'sveltekit-superforms/adapters';
	import { toast } from 'svelte-sonner';
	import * as Form from '$lib/components/ui/form/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { resetPasswordSchema } from './schema.js';

	let { data, form: actionData } = $props();

	let showSuccess = $state(actionData?.success || false);
	let email = $state('');

	function handleSubmit() {
		// Form will be handled by SvelteKit form action
	}
</script>

<div class="container mx-auto max-w-md py-8">
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title class="text-2xl">Reset Password</Card.Title>
			<Card.Description>Enter your email to receive a password reset link</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if showSuccess}
				<div class="space-y-4 text-center">
					<p class="font-medium text-green-600">Password reset email sent</p>
					<p class="text-muted-foreground">Check your inbox for instructions</p>
					<Button href="/auth/signin" variant="outline" class="w-full">Back to sign in</Button>
				</div>
			{:else}
				<form method="POST" class="space-y-4">
					<div class="space-y-2">
						<label for="email" class="text-sm font-medium">Email</label>
						<Input id="email" name="email" type="email" bind:value={email} />
					</div>

					<Button type="submit" class="w-full">Send Reset Email</Button>
				</form>

				<div class="mt-4 text-center text-sm">
					<a href="/auth/signin" class="text-muted-foreground hover:underline"> Back to sign in </a>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
