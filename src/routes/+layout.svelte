<script lang="ts">
	import '../app.css';
	import { Toaster } from 'svelte-sonner';
	import { setupConvex } from 'convex-svelte';
	import { PUBLIC_CONVEX_URL } from '$env/static/public';

	// Initialize Convex client in component context with error handling
	try {
		console.log('Initializing Convex with URL:', PUBLIC_CONVEX_URL);
		setupConvex(PUBLIC_CONVEX_URL || 'http://127.0.0.1:3210');
	} catch (error) {
		console.error('Failed to setup Convex:', error);
	}

	let { children } = $props();
</script>

{@render children()}

<Toaster />
