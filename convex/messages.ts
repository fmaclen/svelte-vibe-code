import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const send = mutation({
	args: {
		body: v.string(),
		token: v.optional(v.string())
	},
	handler: async (ctx, args) => {
		let userId = undefined;
		let author = 'Anonymous';

		// If token is provided, get the user
		if (args.token) {
			const session = await ctx.db
				.query('sessions')
				.withIndex('by_token', (q) => q.eq('token', args.token!))
				.first();

			if (session && session.expiresAt > Date.now()) {
				userId = session.userId;
				const user = await ctx.db.get(userId);
				if (user) {
					author = user.name || user.email || 'User';
				}
			}
		}

		const messageId = await ctx.db.insert('messages', {
			userId,
			author,
			body: args.body,
			created: new Date().toISOString()
		});

		return await ctx.db.get(messageId);
	}
});

export const list = query({
	args: {
		muteWords: v.optional(v.array(v.string()))
	},
	handler: async (ctx, args) => {
		let messages = await ctx.db.query('messages').collect();

		// Filter out messages containing muted words
		if (args.muteWords && args.muteWords.length > 0) {
			messages = messages.filter(
				(message) =>
					!args.muteWords!.some((word) => message.body.toLowerCase().includes(word.toLowerCase()))
			);
		}

		return messages.sort(
			(a, b) => new Date(b.created || '').getTime() - new Date(a.created || '').getTime()
		);
	}
});
