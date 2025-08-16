<script lang="ts">
	import '../app.css';
	import { setupConvex } from 'convex-svelte';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';
	import { setAuthContext } from '$lib/auth.svelte';

	// Initialize Convex client in component context
	setupConvex(PUBLIC_CONVEX_URL);

	// Set up auth context
	setAuthContext();

	let { children } = $props();
</script>

{@render children()}
