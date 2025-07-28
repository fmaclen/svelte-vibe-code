import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const send = mutation({
	args: {
		author: v.string(),
		body: v.string()
	},
	handler: async (ctx, args) => {
		const messageId = await ctx.db.insert('messages', {
			author: args.author,
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
