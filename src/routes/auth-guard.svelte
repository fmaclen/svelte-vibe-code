<script lang="ts">
	import { goto } from '$app/navigation';
	import { useAuth } from '$lib/auth.svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		redirectTo?: string;
		children?: Snippet;
	}

	let { redirectTo = '/login', children }: Props = $props();

	const auth = useAuth();

	// Reactive redirect based on auth state
	$effect(() => {
		if (!auth.isLoading && !auth.isAuthenticated) {
			goto(redirectTo);
		}
	});
</script>

{#if auth.isLoading}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<div class="text-lg">Loading...</div>
		</div>
	</div>
{:else if auth.isAuthenticated}
	{@render children?.()}
{:else}
	<div class="flex min-h-screen items-center justify-center">
		<div class="text-center">
			<div class="text-lg">Redirecting to login...</div>
		</div>
	</div>
{/if}
