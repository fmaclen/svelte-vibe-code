<script lang="ts">
	import { useQuery, useConvexClient } from '$lib/client.svelte';
	import { api } from '../../convex/_generated/api.js';

	let newMessage = $state('');
	let author = $state('Guest');

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
			await client.mutation(api.messages.send, {
				author,
				body: newMessage
			});
			newMessage = '';
		} catch (error) {
			console.error('Failed to send message:', error);
		}
	}
</script>

<div class="container mx-auto p-8">
	<h1 class="mb-6 text-3xl font-bold">Convex + Svelte Demo</h1>

	<div class="mb-6">
		<h2 class="mb-4 text-xl font-semibold">Send a Message</h2>
		<div class="mb-4 flex gap-4">
			<input bind:value={author} placeholder="Your name" class="rounded border px-3 py-2" />
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
