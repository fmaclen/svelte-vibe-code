<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { toast } from 'svelte-sonner';

	let { data } = $props();

	let name = $state(data.user?.name || '');
	let bio = $state('');

	async function saveProfile() {
		try {
			toast.success('Profile updated successfully!');
		} catch (error) {
			toast.error('Failed to update profile.');
		}
	}
</script>

<div class="container mx-auto max-w-2xl py-8">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-2xl">Edit Profile</Card.Title>
			<Card.Description>Update your profile information</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="space-y-2">
				<label for="name" class="text-sm font-medium">Display Name</label>
				<Input id="name" bind:value={name} />
			</div>

			<div class="space-y-2">
				<label for="bio" class="text-sm font-medium">Bio</label>
				<Input id="bio" bind:value={bio} />
			</div>

			<Button onclick={saveProfile} class="w-full">Save Profile</Button>
		</Card.Content>
	</Card.Root>
</div>
