import { mutation } from './_generated/server';

// Development helper functions
// Only use these in development/testing!

export const clearAllData = mutation({
	handler: async (ctx) => {
		if (process.env.NODE_ENV === 'production') {
			throw new Error('Cannot clear data in production!');
		}

		// Clear all messages
		const messages = await ctx.db.query('messages').collect();
		for (const message of messages) {
			await ctx.db.delete(message._id);
		}

		// Clear all sessions
		const sessions = await ctx.db.query('sessions').collect();
		for (const session of sessions) {
			await ctx.db.delete(session._id);
		}

		// Clear all users
		const users = await ctx.db.query('users').collect();
		for (const user of users) {
			await ctx.db.delete(user._id);
		}

		return {
			cleared: {
				messages: messages.length,
				sessions: sessions.length,
				users: users.length
			}
		};
	}
});
