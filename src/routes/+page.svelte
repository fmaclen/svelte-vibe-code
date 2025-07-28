<script>
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<div class="container mx-auto max-w-lg py-8">
	<Card.Root>
		<Card.Header class="text-center">
			<Card.Title class="text-2xl">Welcome</Card.Title>
			<Card.Description>
				Your responsible coding starter kit with test-driven development
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-col gap-4">
			<Button href="/auth/signup" class="w-full">Sign Up</Button>
			<Button href="/auth/signin" variant="outline" class="w-full">Sign In</Button>
		</Card.Content>
	</Card.Root>
</div>
