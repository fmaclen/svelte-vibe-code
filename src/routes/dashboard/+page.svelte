<script>
	import * as Card from '$lib/components/ui/card/index.js';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-2xl py-8">
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title class="text-3xl">Welcome to your dashboard</Card.Title>
			<Card.Description>You have successfully signed up and are now logged in!</Card.Description>
		</Card.Header>
		<Card.Content class="text-center">
			<p class="text-muted-foreground">This is your protected dashboard area.</p>
		</Card.Content>
	</Card.Root>
</div>
