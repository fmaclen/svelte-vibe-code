<script>
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';

	let { data } = $props();

	function navigateToProfile() {
		goto('/profile');
	}
</script>

<div class="container mx-auto max-w-2xl py-8">
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title class="text-3xl">Welcome to your dashboard</Card.Title>
			<Card.Description>Welcome back! You have successfully signed in!</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<p class="text-muted-foreground text-center">This is your protected dashboard area.</p>
			
			<div class="flex gap-2">
				<Button href="/profile" variant="outline" class="flex-1">Profile</Button>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger class="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium outline-none transition-all focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2">
						Account menu
					</DropdownMenu.Trigger>
					<DropdownMenu.Content>
						<DropdownMenu.Item>
							<form method="POST" action="?/signout" use:enhance>
								<button type="submit" class="w-full text-left">Sign Out</button>
							</form>
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</div>
		</Card.Content>
	</Card.Root>
</div>
