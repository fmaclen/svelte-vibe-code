<script lang="ts">
	import { useQuery, useConvexClient } from '$lib/client.svelte';
	import { api } from '../../convex/_generated/api.js';
	import { useAuth } from '$lib/auth.svelte';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import AuthGuard from '$lib/components/AuthGuard.svelte';

	let newMessage = $state('');

	const auth = useAuth();

	// Get client with error handling
	let client: any = $state();
	let messages: any = $state();

	try {
		client = useConvexClient();
		messages = useQuery(api.messages.list, () => ({ muteWords: [] }));
	} catch (error) {
		console.error('Failed to initialize Convex client:', error);
	}

	async function sendMessage() {
		if (!newMessage.trim() || !client) return;

		try {
			const token = localStorage.getItem('auth_token');
			await client.mutation(api.messages.send, {
				body: newMessage,
				token: token || undefined
			});
			newMessage = '';
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	}

	async function handleSignOut() {
		await auth.signOut();
		// AuthGuard will handle the redirect
	}
</script>

<AuthGuard>
	<div class="container mx-auto p-8">
		<div class="mb-6 flex items-center justify-between">
			<h1 class="text-3xl font-bold">Convex + Svelte Demo</h1>
			<div class="flex items-center gap-4">
				<span class="text-sm text-gray-600">
					{auth.user?.email || 'Anonymous User'}
				</span>
				<Button variant="outline" size="sm" onclick={handleSignOut}>Sign Out</Button>
			</div>
		</div>

		<div class="mb-6">
			<h2 class="mb-4 text-xl font-semibold">Send a Message</h2>
			<div class="mb-4 flex gap-4">
				<input
					bind:value={newMessage}
					placeholder="Type a message..."
					class="flex-1 rounded border px-3 py-2"
					onkeydown={(e) => e.key === 'Enter' && sendMessage()}
				/>
				<button
					onclick={sendMessage}
					disabled={!newMessage.trim()}
					class="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50"
				>
					Send
				</button>
			</div>
		</div>

		<div>
			<h2 class="mb-4 text-xl font-semibold">Messages</h2>
			{#if !messages}
				<p class="text-orange-500">Convex client not initialized</p>
			{:else if messages.isLoading}
				<p>Loading messages...</p>
			{:else if messages.error}
				<p class="text-red-500">Error: {messages.error.toString()}</p>
			{:else if messages.data}
				<div class="space-y-2">
					{#each messages.data as message}
						<div class="rounded border p-3">
							<strong>{message.author}:</strong>
							{message.body}
							{#if message.created}
								<div class="text-sm text-gray-500">
									{new Date(message.created).toLocaleString()}
								</div>
							{/if}
						</div>
					{:else}
						<p class="text-gray-500">No messages yet. Send the first one!</p>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</AuthGuard>
