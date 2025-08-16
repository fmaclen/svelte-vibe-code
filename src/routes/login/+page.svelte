<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/auth.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Alert, AlertDescription } from '$lib/components/ui/alert';

	let mode: 'signin' | 'signup' = $state('signin');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let isLoading = $state(false);

	const auth = useAuth();

	// Redirect if already authenticated
	$effect(() => {
		if (auth.isAuthenticated && !auth.isLoading) {
			goto('/');
		}
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		error = '';
		isLoading = true;

		try {
			if (mode === 'signin') {
				await auth.signIn(email, password);
			} else {
				await auth.signUp(email, password);
			}
			// Small delay to ensure auth state is updated
			setTimeout(() => goto('/'), 100);
		} catch (err: any) {
			error = err.message || 'Authentication failed';
			isLoading = false;
		}
	}

	async function handleAnonymous() {
		error = '';
		isLoading = true;

		try {
			await auth.signInAnonymously();
			// Small delay to ensure auth state is updated
			setTimeout(() => goto('/'), 100);
		} catch (err: any) {
			error = err.message || 'Anonymous sign in failed';
			isLoading = false;
		}
	}
</script>

<div class="container mx-auto flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-md space-y-6">
		<h1 class="text-center text-2xl font-semibold">
			{mode === 'signin' ? 'Sign in to manage your account' : 'Create a new account'}
		</h1>

		<form onsubmit={handleSubmit} class="space-y-4">
			<Input type="email" bind:value={email} placeholder="Email" required disabled={isLoading} />

			<Input
				type="password"
				bind:value={password}
				placeholder="Password"
				required
				disabled={isLoading}
			/>

			{#if error}
				<Alert variant="destructive">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			{/if}

			<Button type="submit" class="w-full" disabled={isLoading}>
				{isLoading ? 'Loading...' : mode === 'signin' ? 'Sign in' : 'Sign up'}
			</Button>
		</form>

		<div class="text-center text-sm">
			<span class="text-muted-foreground">
				{mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
			</span>
			<button
				type="button"
				class="text-blue-600 hover:underline"
				onclick={() => (mode = mode === 'signin' ? 'signup' : 'signin')}
				disabled={isLoading}
			>
				{mode === 'signin' ? 'Sign up instead' : 'Sign in instead'}
			</button>
		</div>

		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t"></span>
			</div>
			<div class="relative flex justify-center text-sm">
				<span class="bg-background px-2 text-muted-foreground">or</span>
			</div>
		</div>

		<Button variant="secondary" class="w-full" onclick={handleAnonymous} disabled={isLoading}>
			Sign in anonymously
		</Button>
	</div>
</div>
